import "./Types.js";
import * as libUtilsTy from "../Utils-typed.js";
import * as CoGr from "./CommonGrammar.js";
import DictStd from "./DictStd.js";
import DictSyntax from "./DictSyntax.js";
import { MergeDictionaries_ } from "./aAux.js";



/**
 * Состояние интерпретатора LLL.
 */
export class LLL_STATE {

  /**
   * @type {Record<string, LLL_Value>}
   * @readonly
   */
  ScriptMetadata = {};

  /**
   * @type {string[]}
   * @readonly
   */
  StringsTable = [
    "" //Строка с индексом (0) - пустая строка.
  ];

  /**
   * @type {libUtilsTy.IStack<LLL_Value>}
   * @readonly
   */
  Stack = libUtilsTy.IStack.create();

  /**
   * Имитация текущей области видимости.
   * @type {string[]} это 'IStack' так-то, однако нам нужны методы массивов.
   * @readonly
   */
  PseudoScope = [];

  /**
   * Словарь **пользовательских** определений.
   * Напоминаю, что никаких областей видимости на самом деле не существует, и структура словаря плоская.
   * 
   * @type {Dictionary}
   * @readonly
   */
  UserDict = new Map();

  /**
   * Словарь **изначальных** определений.
   * 
   * Отличается тем, что определения здесь **константны**, а также не могут иметь области видимости -
   *  т.е. все данные слова всегда интерпретируются однозначно.
   * 
   * @type {ConstDict}
   * @readonly
   */
  PrimordialDict = MergeDictionaries_(DictSyntax, DictStd);

  /**
   * Хранилище дополнительных состояний интерпретатора.
   * @readonly
   */
  StateStorage = {
    /** Свободный номер для анонимных областей видимости. */
    _CurrentSymbolIndex: 1,

    /**
     * (Используется для синтаксических конструкций)
     * Блок кода определения, идущий после данной инструкции.
     * @type {CodeFragment | null}
     */
    PostBlock: null,
  };

  ScriptFullPath = "no-file";

  /**
   * Дополнительная информация о том, где сейчас находится интерпретатор.
   * @type {string | null}
   */
  AdditionalLocationInfo = null;

  /**
   * Функция для получения ввода из текущего потока ввода (`stdin`)
   */
  StdIN = () => undefined; //W.I.P.

  /**
   * Функция для записи в текущий поток вывода (`stdout`)
   */
  StdOUT = Message => console.log(Message);

  /**
   * Функция для записи в текущий поток вывода ошибок (`stderr`)
   */
  StdERR = Message => console.error(Message);

  /**
   * Читатель, связанный с данным состоянием LLL.
   * @type {TheReader}
   */
  TheReader = libUtilsTy.__Any;

  /**
   * Обработчик ошибок (исключений) **на уровне платформы.**
   * @type {(ExcClass: KnownExceptionClass) => never}
   */
  _ExceptionHandler = (ExcClass) => {
    throw ExcClass;
  };
}



/**
 * Используется в функциях обработки токенов
 * @type {Readonly<Record<"CONTINUE" | "JUST_TOKEN" | "SKIP_TOKEN" | "DRAIN_BUF", number>>}
 * @enum {number}
 */
const _HandleTokenResult = {
  CONTINUE:     0, //в этом звене цепочки ничего не нашли; продолжаем цепочку проверок
  JUST_TOKEN:   1, //просто добавляем в буфер; прерываем цепочку проверок
  SKIP_TOKEN:   1 << 1, //пропускаем токен
  DRAIN_BUF:    1 << 2, //в буфер НЕ добавляем: возвращаем значение буфера из 'GrabUnit'
};

/**
 * Читатель кода.
 * Специализирован под LLL (подверает код начальной обработке).
 */
export class TheReader {

  Pos = 0;
  EndsAt;

  LineIndex = 1;
  Column = 1;

  PreviousUnit = ""; //для instant-lookbehind инструкций (FUTURE)
  #PreviousUnitCandidate = "";

  PreviousPos = 0;
  #PreviousPosCandidate = 0;

  PreviousLineIndex = 1;
  #PreviousLineIndexCandidate = 1;

  PreviousColumn = 1;
  #PreviousColumnCandidate = 1;

  #Buf = "";
  #AllCode;

  get __AllCode() { return this.#AllCode; }

  /** Внутреннее состояние интерпретатора. */
  #InternalState = {
    /** Режим интерпретации СТРОЧНОГО комментария? */
    CommentLine: false,

    /** Режим интерпретации ВСТРОЕННОГО комментария? */
    InlineComment: false,

    /** Режим интерпретации НОМИНАЛЬНОЙ строки? ``(` обратная кавычка)`` */
    NominalString: false,

    /** Режим интерпретации ВИРТУАЛЬНОЙ строки? `(" двойная кавычка)` */
    VirtualString: false,
  };

  /** Мы достигли конца кода? */
  IsCodeEnd = false;

  /** Мы достигли конца ФРАГМЕНТА кода? (текущего интерпретируемого определения) */
  IsFragmentEnd = false;

  /** Дополнительные опции чтения/интерпретации. Регулируются извне. @readonly */
  Options = {
    /** Обрабатывать встраиваемые комментарии? */
    HandleInlineComments: true,

    /** Обрабатывать строчные комментарии? */
    HandleCommentLines: true,

    /**
     * То, что считается "границей" текущей единицы кода: конец слова, конец строки, ...
     * 
     * Должен быть ОДИН символ. Иначе ба-бах.
     */
    UnitBound: " ",

    /** Возвращать ли буфер (из {@link GrabUnit()}) при переходе на новую строку? */
    DrainOnNewline: true,

    /** Пропускать пустые единицы кода? */
    SkipEmptyUnits: true,
  };

  /**
   * @param {string} AllCode 
   */
  constructor(AllCode) {
    this.#AllCode = AllCode;
    this.EndsAt = AllCode.length - 1;
  }

  /**
   * *Извлекает из потока кода* текущую единицу кода (слово, строку и т.д.)
   * 
   * Если внезапно Читатель достиг конца кода - данная функция вернёт некорректное значение.
   * Проверка конца кода ({@link IsCodeEnd}) перед дальнейшей обработкой единицы кода -
   *  на вашей совести!
   * @returns {string}
   */
  GrabUnit() {
    this.IsFragmentEnd = false;
    this.PreviousUnit = this.#PreviousUnitCandidate;
    this.PreviousPos = this.#PreviousPosCandidate;
    this.PreviousColumn = this.#PreviousColumnCandidate;
    this.PreviousLineIndex = this.#PreviousLineIndexCandidate;

    if (this.Pos - 1 == this.EndsAt) {
      this.IsCodeEnd = true;
      return libUtilsTy.__Any;
    }

    while (true) {
      const Tk = this.#AllCode[this.Pos];
      this.Pos++;

      let CurrentStatus = this.#MaybeHandle_Newline(Tk)
        || this.#MaybeHandle_String(Tk)
        || this.#MaybeHandle_CommentLine(Tk)
        || this.#MaybeHandle_InlineComment(Tk)
        || this.#MaybeHandle_InterpretingUnitBound(Tk);
      if (CurrentStatus == _HandleTokenResult.CONTINUE
        || CurrentStatus & _HandleTokenResult.JUST_TOKEN
      ) this.#Buf += Tk; //нет спец.значения => просто токен, добавить в буфер
      
      if (this.Pos - 1 == this.EndsAt) {
        if (this.#Buf.length > 0)
          return this.#DrainBuffer();
        this.IsCodeEnd = true;
        return libUtilsTy.__Any;
      }

      if (CurrentStatus & _HandleTokenResult.SKIP_TOKEN) continue;
      else if (CurrentStatus & _HandleTokenResult.DRAIN_BUF) return this.#DrainBuffer();
    }
  }

  /**
   * Возвращается курсор Читателя к предыдущей единице кода.
   * 
   * Размер истории - `1`. Это значит, что можно прыгнуть только 1 раз подряд
   *  (т.е. более поздняя история не сохранилась)
   */
  JumpBack() {
    this.Pos = this.PreviousPos;
    this.Column = this.PreviousColumn;
    this.LineIndex = this.PreviousLineIndex;
  }

  /**
   * @returns {string}
   */
  #DrainBuffer() {
    const Word = this.#Buf;
    this.#Buf = "";
    this.#PreviousUnitCandidate = Word;
    this.#PreviousPosCandidate = this.Pos;
    return Word;
  }

  /* Обратите внимание: методы '#MaybeHandle_*' не должны мутировать
  |  "глобальное" состояние Читателя (поля '#Bounds', 'Pos', '#AllCode').
  Исключение - внутреннее состояние ('#InternalState') и '#LineIndex' (в методе '#MaybeHandle_Newline').
  Кроме этого, данные функции не должны читать код самостоятельно (могут получать лишь
  |  один прочитанный символ, + иметь доступ к буферу '#Buf')
  |  или мутировать "глобальное" состояние Читателя. */

  /**
   * Часть {@link GrabUnit()}, отвечающая за обработку переходов на новую строку.
   * @param {string} Tk 
   * @returns {number}
   */
  #MaybeHandle_Newline(Tk) {
    if (Tk == "\n") {
      this.LineIndex++;
      this.Column = 0; //increment'им в основном цикле
      if (this.#Buf.length > 0 && this.Options.DrainOnNewline)
        return _HandleTokenResult.DRAIN_BUF;
      return _HandleTokenResult.SKIP_TOKEN;
    }
    if (Tk == "\r")
      return _HandleTokenResult.SKIP_TOKEN;
    return _HandleTokenResult.CONTINUE;
  }

  /**
   * Часть {@link GrabUnit()}, отвечающая за обработку строк.
   * @param {string} Tk 
   * @returns {number}
   */
  #MaybeHandle_String(Tk) {
    if (Tk == CoGr.TK_NOMINAL_STRING) {
      if (this.#InternalState.NominalString) {
        this.#InternalState.NominalString = false;
        return _HandleTokenResult.JUST_TOKEN | _HandleTokenResult.DRAIN_BUF;
      }
      else {
        this.#InternalState.NominalString = true;
        return _HandleTokenResult.JUST_TOKEN; //у нас, строки должны содержать кавычки
      }
    }
    else if (Tk == CoGr.TK_VIRTUAL_STRING) {
      if (this.#InternalState.VirtualString) {
        this.#InternalState.VirtualString = false;
        return _HandleTokenResult.JUST_TOKEN | _HandleTokenResult.DRAIN_BUF;
      }
      else {
        this.#InternalState.VirtualString = true;
        return _HandleTokenResult.JUST_TOKEN; //у нас, строки должны содержать кавычки
      }
    }
    if (this.#InternalState.NominalString || this.#InternalState.VirtualString)
      return _HandleTokenResult.JUST_TOKEN;
    else
      return _HandleTokenResult.CONTINUE;
  }

  /**
   * Часть {@link GrabUnit()}, отвечающая за обработку строчных комментариев.
   * @param {string} Tk 
   * @returns {number}
   */
  #MaybeHandle_CommentLine(Tk) {
    if (!this.Options.HandleCommentLines)
      return _HandleTokenResult.CONTINUE;

    if (!this.#InternalState.InlineComment && Tk == CoGr.TK_COMMENT_LINE_START_A || Tk == CoGr.TK_COMMENT_LINE_START_B) { //начало коммента
      this.#InternalState.CommentLine = true;
      return _HandleTokenResult.SKIP_TOKEN;
    }
    if (Tk == "\n") { //конец коммента
      this.#InternalState.CommentLine = false;
      if (this.#Buf.length > 0 && this.Options.DrainOnNewline)
        return _HandleTokenResult.DRAIN_BUF; //начало строчного комментария = переход на новую строку.
      return _HandleTokenResult.SKIP_TOKEN;
    }
    if (this.#InternalState.CommentLine)
      return _HandleTokenResult.SKIP_TOKEN;
    return _HandleTokenResult.CONTINUE;
  }

  /**
   * Часть {@link GrabUnit()}, отвечающая за обработку встраиваемых комментариев.
   * @param {string} Tk 
   * @returns {number}
   */
  #MaybeHandle_InlineComment(Tk) {
    if (!this.Options.HandleInlineComments)
      return _HandleTokenResult.CONTINUE;

    if (Tk == CoGr.TK_INLINE_COMMENT_START) { //начало коммента
      this.#InternalState.InlineComment = true;
      return _HandleTokenResult.SKIP_TOKEN;
    }
    if (this.#InternalState.InlineComment && Tk == CoGr.TK_INLINE_COMMENT_END) { //конец коммента
      this.#InternalState.InlineComment = false;
      return _HandleTokenResult.SKIP_TOKEN;
    }
    if (this.#InternalState.InlineComment)
      return _HandleTokenResult.SKIP_TOKEN;
    return _HandleTokenResult.CONTINUE;
  }

  /**
   * Граница интересующей нас единицы кода: пробела, перехода на новую строку и т.д.
   * @param {string} Tk 
   * @returns {number}
   */
  #MaybeHandle_InterpretingUnitBound(Tk) {
    if (Tk == this.Options.UnitBound) {
      if (this.#Buf.length > 0 || !this.Options.SkipEmptyUnits)
        return _HandleTokenResult.DRAIN_BUF;
      return _HandleTokenResult.SKIP_TOKEN;
    }
    return _HandleTokenResult.CONTINUE;
  }
}



export class CodeFragment {
  /** @type {(string | CodeFragment)[]} */
  Words;

  /** @type {string} */
  Label;

  /**
   * (НЕ РЕКУРСИВНО) Превращает текущее определение в самый обычный массив слов,
   *  сохраняя (псевдо-) области видимости.
   * @mutates
   */
  MakeFlat() {
    for (let i = 0; i < this.Words.length; i++) {
      const W = this.Words[i];
      if (typeof W == "object")
      this.Words.splice(i, 1, ...[
        this.Label,
        CoGr.Instr.EnterScope,
        ...W.Words,
        CoGr.Instr.ExitScope,
      ]);
    }
  }

  /**
   * @param {(string | CodeFragment)[]} Words 
   * @param {string} Label 
   */
  constructor(Words, Label) {
    this.Words = Words;
    this.Label = Label;
  }
}
