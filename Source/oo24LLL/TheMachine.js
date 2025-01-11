import "./Types.js";
import * as libUtilsTy from "../Utils-typed.js";
import DictStd from "./DictStd.js";
import DictSyntax from "./DictSyntax.js";
import * as __Aux from "./aAux.js";



/**
 * Состояние интерпретатора LLL.
 */
export class LLL_STATE {

  /**
   * @type {Record<string, llval_ty>}
   * @readonly
   */
  ScriptMetadata = {};

  /**
   * @type {{}}
   * @readonly
   */
  Pragmas = {};

  /**
   * @type {string[]}
   * @readonly
   */
  StringsTable = [];

  /**
   * @type {libUtilsTy.IStack<llval_ty>}
   * @readonly
   */
  Stack = new libUtilsTy.IStack();

  /**
   * Стек *замыканий*: областей видимости слов(функций) и переменных.
   * @type {libUtilsTy.IStack<Map<string, llval_ty | NativeJsFunction | TheReaderStream>>}
   * @readonly
   */
  Closures = new libUtilsTy.IStack( //Замыкания по умолчанию:
    DictSyntax,
    DictStd,
    new Map(),
  );

  /**
   * Интерпретируемое в данный момент слово.
   * @type {string}
   */
  CurrentInterpretingWord = ""; //Ответственность закреплена за 'RecursiveInterpret'

  /**
   * Текущий поток ввода (`stdin`)
   */
  StdIN = process.stdin;

  /**
   * Текущий поток вывода (`stdout`)
   */
  StdOUT = process.stdout;

  /**
   * Текущий поток вывода ошибок (`stderr`)
   */
  StdERR = process.stderr;
}



/** Начало строчного комментария */
const TK_COMMENT_LINE_START = ";";

/** Начало встраиваемого комментария */
const TK_INLINE_COMMENT_START = "(";

/** Конец встраиваемого комментария */
const TK_INLINE_COMMENT_END = ")";

/**
 * Используется в функциях обработки токенов
 * @type {Readonly<Record<"NOTHING" | "CONTINUE_LOOP" | "DRAIN_BUF", 0 | 1 | 2>>}
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

  Pos = 0;

  /**
   * Осуществляет "переход" к интерпретации определения (некого фрагмента кода)
   * @param {WordDefinitionFragment} Definition
   */
  GotoDefinition(Definition) {
    this.#Bounds.push(Definition);
    this.Pos = Definition.StartsAt;
  }

  /**
   * Антоним {@link GotoDefinition()} - осуществляет ОБРАТНЫЙ переход,
   * "выход" из интерпретации определения.
   */
  ExitDefinition() {
    this.#Bounds.pop();
    this.IsFragmentEnd = true;
    if (this.#Bounds.length == 0)
      this.IsCodeEnd = true;
  }

  #LineIndex = 0;
  get LineIndex() {
    return this.#LineIndex;
  }

  /** Позиция перед извлечением единицы кода. @type {number} */
  #PreviousPosition = 0;

  /** @type {string} */
  #Buf = "";

  /** @type {string} */
  #AllCode;

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

  /** Дополнительные опции чтения/интерпретации. Регулируются извне. */
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
    this.#Bounds = new libUtilsTy.IStack(new WordDefinitionFragment(0, AllCode.length - 1));
  }

  /**
   * *Извлекает из потока кода* текущую единицу кода (слово, строку и т.д.)
   * 
   * Проверка конца кода на вашей совести!
   * @returns {string}
   */
  GrabUnit() {
    this.IsFragmentEnd = false;
    this.#PreviousPosition = this.Pos;

    while (this.Pos < this.#Bounds.peek().EndsAt) {
      const Tk = this.#AllCode[this.Pos];
      this.Pos++;

      let CurrentStatus = this.#MaybeHandle_Newline(Tk)
        || this.#MaybeHandle_CommentLine(Tk)
        || this.#MaybeHandle_InlineComment(Tk)
        || this.#MaybeHandle_InterpretingUnitBound(Tk);
      if (CurrentStatus == 1) continue;
      else if (CurrentStatus == 2) return this.#DrainBuffer();

      this.#Buf += Tk;
    }

    this.ExitDefinition();
    return libUtilsTy.__Any;
  }

  /**
   * Отменяет предыдущее извлечение из потока.
   */
  RevertGrabbing() {
   this.Pos = this.#PreviousPosition;
  }

  /**
   * @returns {string}
   */
  #DrainBuffer() {
    const Word = this.#Buf;
    this.#Buf = "";
    return Word;
  }

  /**
   * Часть {@link GrabUnit()}, отвечающая за обработку переходов на новую строку.
   * @param {string} Tk 
   * @returns {0 | 1 | 2} `0` - ничего не найдено, идём дальше; `1` - обработано, начинаем новый цикл; `2` - делаем возврат из {@link GrabUnit()} (возвращаем буфер)
   */
  #MaybeHandle_Newline(Tk) {
    if (Tk == "\n") {
      this.#LineIndex++;
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
