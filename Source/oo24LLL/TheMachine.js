import "./Types.js";
import * as libUtilsTy from "../Utils-typed.js";
import DictStd from "./DictStd.js";
import DictSyntax from "./DictSyntax.js";
import { TK_INLINE_COMMENT_START, TK_INLINE_COMMENT_END, TK_COMMENT_LINE_START } from "./CommonGrammar.js";
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
  VirtualScope = [];

  /**
   * Словарь **пользовательских** определений.
   * Напоминаю, что никаких областей видимости на самом деле не существует, и структура словаря плоская.
   * 
   * @type {LLL_Dictionary}
   * @readonly
   */
  UserDict = new Map();

  /**
   * Словарь **изначальных** определений.
   * 
   * Отличается тем, что определения здесь **константны**, а также не могут иметь области видимости -
   *  т.е. все данные слова всегда интерпретируются однозначно.
   * 
   * @type {LLL_ConstDict}
   * @readonly
   */
  PrimordialDict = MergeDictionaries_(DictSyntax, DictStd);

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
   * @type {TheReaderStream}
   */
  TheReader = libUtilsTy.__Any;

  /**
   * Обработчик ошибок (исключений) **на уровне платформы.**
   * @type {(ExcClass: _KnownExceptionClasses) => never}
   */
  _ExceptionHandler = (ExcClass) => {
    throw ExcClass;
  };
}



/**
 * Используется в функциях обработки токенов
 * @type {Readonly<Record<"NOTHING" | "CONTINUE_LOOP" | "DRAIN_BUF", 0 | 1 | 2>>}
 * @enum {0 | 1 | 2}
 */
const _HandleTokenResult = {
  NOTHING:        0,
  CONTINUE_LOOP:  1,
  DRAIN_BUF:      2,
};

/**
 * Читатель кода.
 * Специализирован под LLL.
 */
export class TheReaderStream {

  /** @type {libUtilsTy.IStack<WordDefinitionFragment>} */
  #Bounds;

  /** @type {libUtilsTy.IStack<number>} */
  #Cursors = libUtilsTy.IStack.createAndFill(0);

  get Pos() {
    return this.#Cursors.peek();
  }
  set Pos(X) {
    this.#Cursors[this.#Cursors.length - 1] = X;
  }

  LineIndex = 0;

  Column = 0;

  PreviousUnit = "";

  #PreviousUnitCandidate = "";

  #Buf = "";

  /** @type {string} */
  #AllCode;

  get __AllCode() { return this.#AllCode; }

  /** Внутреннее состояние интерпретатора. */
  #InternalState = {
    /** Режим интерпретации СТРОЧНОГО комментария? */
    CommentLine: false,

    /** Режим интерпретации ВСТРОЕННОГО комментария? */
    InlineComment: false,
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
    this.#Bounds = libUtilsTy.IStack.createAndFill(new WordDefinitionFragment(0, AllCode.length - 1));
  }

  /**
   * *Извлекает из потока кода* текущую единицу кода (слово, строку и т.д.)
   * 
   * Проверка конца кода ({@link IsCodeEnd}) на вашей совести!
   * @returns {string}
   */
  GrabUnit() {
    this.IsFragmentEnd = false;
    this.PreviousUnit = this.#PreviousUnitCandidate;

    if (this.Pos - 1 == this.#Bounds.peek().EndsAt) {
      this.ExitDefinition();
      return this.#DrainBuffer();
    }

    while (!this.IsCodeEnd) {
      const Tk = this.#AllCode[this.Pos];
      this.Pos++;

      let CurrentStatus = this.#MaybeHandle_Newline(Tk)
        || this.#MaybeHandle_CommentLine(Tk)
        || this.#MaybeHandle_InlineComment(Tk)
        || this.#MaybeHandle_InterpretingUnitBound(Tk);
      if (CurrentStatus == 0)
        this.#Buf += Tk;
      
      if (this.Pos - 1 == this.#Bounds.peek().EndsAt) {
        this.ExitDefinition();
        return this.#DrainBuffer();
      }

      if (CurrentStatus == 1) continue;
      else if (CurrentStatus == 2) return this.#DrainBuffer();
    }
    
    return libUtilsTy.__Any;
  }


  /**
   * *Просматривает, не извлекая* текущую единицу кода (слово, строку и т.д.)
   * 
   * (Не модифицирует "глобальное" состояние Читателя)
   * 
   * Проверка конца кода ({@link IsCodeEnd}) на вашей совести!
   * @returns {string}
   */
  PeekUnit() {
    const OriginalLineIndex = this.LineIndex;
    const OriginalColumn = this.Column;
    if (this.Pos - 1 == this.#Bounds.peek().EndsAt) {
      this.LineIndex = OriginalLineIndex;
      this.Column = OriginalColumn;
      return this.#DrainBuffer();
    }

    this.PreviousUnit = this.#PreviousUnitCandidate;
    let _LocalPos = this.Pos;
    while (!this.IsCodeEnd) {
      const Tk = this.#AllCode[_LocalPos];
      _LocalPos++;
      this.Column++;

      let CurrentStatus = this.#MaybeHandle_Newline(Tk)
        || this.#MaybeHandle_CommentLine(Tk)
        || this.#MaybeHandle_InlineComment(Tk)
        || this.#MaybeHandle_InterpretingUnitBound(Tk);
      if (CurrentStatus == 0)
        this.#Buf += Tk;
      
      if (_LocalPos - 1 == this.#Bounds.peek().EndsAt) {
        this.LineIndex = OriginalLineIndex;
        this.Column = OriginalColumn;
        return this.#DrainBuffer();
      }

      if (CurrentStatus == 1) continue;
      else if (CurrentStatus == 2) {
        this.LineIndex = OriginalLineIndex;
        this.Column = OriginalColumn;
        return this.#DrainBuffer()
      }
    }
    
    return libUtilsTy.__Any;
  }

  /**
   * Осуществляет "переход" к интерпретации определения (некого фрагмента кода)
   * @param {WordDefinitionFragment} Definition
   */
  GotoDefinition(Definition) {
    this.#Bounds.push(Definition);
    this.#Cursors.push(Definition.StartsAt);
  }

  /**
   * Антоним {@link GotoDefinition()} - осуществляет ОБРАТНЫЙ переход,
   * "выход" из интерпретации определения.
   */
  ExitDefinition() {
    this.#Bounds.pop();
    this.#Cursors.pop();
    this.IsFragmentEnd = true;
    if (this.#Bounds.length == 0) {
      this.IsCodeEnd = true;
    }
  }

  /**
   * @returns {string}
   */
  #DrainBuffer() {
    const Word = this.#Buf;
    this.#Buf = "";
    this.#PreviousUnitCandidate = Word;
    return Word;
  }

  /* Обратите внимание: методы '#MaybeHandle_*' не должны мутировать
  "глобальное" состояние Читателя (поля '#Bounds', 'Pos', '#AllCode').
  Исключение - внутреннее состояние ('#InternalState') и '#LineIndex' (в методе '#MaybeHandle_Newline').
  Кроме этого, данные функции не должны читать код самостоятельно (могут получать лишь один прочитанный символ,
  + иметь доступ к буферу '#Buf') или мутировать "глобальное" состояние Читателя. */

  /**
   * Часть {@link GrabUnit()}, отвечающая за обработку переходов на новую строку.
   * @param {string} Tk 
   * @returns {0 | 1 | 2} `0` - ничего не найдено, идём дальше; `1` - обработано, начинаем новый цикл; `2` - делаем возврат из {@link GrabUnit()} (возвращаем буфер)
   */
  #MaybeHandle_Newline(Tk) {
    if (Tk == "\n") {
      this.LineIndex++;
      this.Column = 0; //increment'им в основном цикле
      if (this.#Buf.length > 0 && this.Options.DrainOnNewline)
        return _HandleTokenResult.DRAIN_BUF;
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    if (Tk == "\r")
      return _HandleTokenResult.CONTINUE_LOOP;
    return _HandleTokenResult.NOTHING;
  }

  #MaybeHandle_CommentLine(Tk) {
    if (!this.Options.HandleCommentLines)
      return _HandleTokenResult.NOTHING;

    if (Tk == TK_COMMENT_LINE_START) { //начало коммента
      this.#InternalState.CommentLine = true;
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    if (Tk == "\n") { //конец коммента
      this.#InternalState.CommentLine = false;
      if (this.#Buf.length > 0 && this.Options.DrainOnNewline)
        return _HandleTokenResult.DRAIN_BUF; //начало строчного комментария = переход на новую строку.
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    if (this.#InternalState.CommentLine)
      return _HandleTokenResult.CONTINUE_LOOP;
    return _HandleTokenResult.NOTHING;
  }

  #MaybeHandle_InlineComment(Tk) {
    if (!this.Options.HandleInlineComments)
      return _HandleTokenResult.NOTHING;

    if (Tk == TK_INLINE_COMMENT_START) { //начало коммента
      this.#InternalState.InlineComment = true;
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    if (this.#InternalState.InlineComment && Tk == TK_INLINE_COMMENT_END) { //конец коммента
      this.#InternalState.InlineComment = false;
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    if (this.#InternalState.InlineComment)
      return _HandleTokenResult.CONTINUE_LOOP;
    return _HandleTokenResult.NOTHING;
  }

  /**
   * Граница интересующей нас единицы кода: пробела, перехода на новую строку и т.д.
   */
  #MaybeHandle_InterpretingUnitBound(Tk) {
    if (Tk == this.Options.UnitBound) {
      if (this.#Buf.length > 0 || !this.Options.SkipEmptyUnits)
        return _HandleTokenResult.DRAIN_BUF;
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    return _HandleTokenResult.NOTHING;
  }
}



/**
 * Координаты (индексы) начала и конца фрагмента кода,
 * являющимся определением некого слова.
 */
export class WordDefinitionFragment {

  /** @type {number} */
  StartsAt;

  /** @type {number} */
  EndsAt;

  /**
   * @param {number} StartIndex 
   * @param {number} EndIndex 
   */
  constructor(StartIndex, EndIndex) {
    this.StartsAt = StartIndex;
    this.EndsAt = EndIndex;
  }
}
