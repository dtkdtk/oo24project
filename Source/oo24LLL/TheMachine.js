import "./Types.js";
import * as libUtilsTy from "../Utils-typed.js";
import DictStd from "./DictStd.js";
import DictSyntax from "./DictSyntax.js";
import { _AuxGetStateStace } from "./AuxStateTrace.js";
import * as _AuxReprConversions from "./AuxReprConversions.js";



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
   * @type {libUtilsTy.IStack<Map<string, llval_ty | NativeJsFunction | _WordStream>>}
   * @readonly
   */
  Closures = new libUtilsTy.IStack( //Замыкания по умолчанию:
    DictSyntax,
    DictStd,
    new Map(),
  );

  /**
   * Набор вспомогательных функций.
   * @readonly
   */
  aux = { //Использовать исключительно стрелочные функции!!!

    /**
     * Выбрасывает RuntimeException.
     * @param {string} Msg
     * @returns {never}
     */
    ThrowRuntimeExc: (Msg) => {
      console.error("LLL Runtime exception: " + Msg + "\n");
      console.error(this.aux.GetStateTrace());
      throw "LLL RuntimeException";
    },
    /**
     * Специализация `ThrowRuntimeExc` с пояснением места, где возникла ошибка.
     * @param {string} Where 
     * @param {string} Msg 
     * @returns {never}
     */
    ThrowRuntimeExc_At: (Where, Msg) =>
      this.aux.ThrowRuntimeExc(`'${Where}': ${Msg}`),

    /**
     * @param {boolean} Condition 
     * @param {string} ErrorMsg 
     * @returns {never | void}
     */
    Assert: (Condition, ErrorMsg) =>
      !Condition ? this.aux.ThrowRuntimeExc(ErrorMsg) : undefined,
    /**
     * Специализация `Assert` с пояснением места, где выполняется ассерт.
     * @param {string} Where 
     * @param {boolean} Condition 
     * @param {string} ErrorMsg 
     * @returns {never | void}
     */
    Assert_At: (Where, Condition, ErrorMsg) =>
      !Condition ? this.aux.ThrowRuntimeExc_At(Where, ErrorMsg) : undefined,

    /**
     * Проверяет, достаточно ли значений в стеке.
     * @param {number} Needed
     * @returns {void | never}
     */
    AssertStackLength: (Needed) => {
      if (this.Stack.length < Needed)
      this.aux.ThrowRuntimeExc_At(this.CurrentInterpretingWord, "Not enough values on stack."
        + `\n\tExpected '${Needed}', stack contains '${this.Stack.length}'.`)
    },

    /**
     * Возвращает `LLL_STATE`, готовую к выводу в консоль.
     * @returns {string}
     * @see {@link _AuxGetStateStace() source}
     */
    GetStateTrace: () => _AuxGetStateStace(this), //extern

    /**
     * Конвертирует указанное представление в runtime-значение.
     * 
     * *Представление* -> __*Значение*__
     * @param {llrepr_ANY_ty} Repr
     * @returns {llval_ty}
     * @see {@link _AuxReprConversions.RtvalueOf() source}
     */
    RtvalueOf: _AuxReprConversions.RtvalueOf.bind(this), //extern
    /**
     * Специализация {@link RtvalueOf()} для чисел.
     * 
     * *Представление* -> __*Значение*__
     * @param {number} NumRepr 
     * @returns {llval_ty}
     * @see {@link _AuxReprConversions.RtvalueOf_Number() source}
     */
    RtvalueOf_Number: _AuxReprConversions.RtvalueOf_Number.bind(this), //extern
    /**
     * Специализация {@link RtvalueOf()} для строк.
     * 
     * *Представление* -> __*Значение*__
     * @param {string} StrRepr 
     * @returns {llval_ty}
     * @see {@link _AuxReprConversions.RtvalueOf_String() source}
     */
    RtvalueOf_String: _AuxReprConversions.RtvalueOf_String.bind(this), //extern

    /**
     * Конвертирует runtime-значение в целое число.
     * 
     * *Значение* -> __*Представление*__
     * @param {llval_ty} Rtvalue
     * @returns {number | never}
     * @see {@link _AuxReprConversions.ReprAs_Integer() source}
     */
    ReprAs_Integer: _AuxReprConversions.ReprAs_Integer.bind(this), //extern
    /**
     * Конвертирует runtime-значение в число с плавающей точкой.
     * 
     * *Значение* -> __*Представление*__
     * @param {llval_ty} Rtvalue
     * @returns {number | never}
     * @see {@link _AuxReprConversions.ReprAs_Float() source}
     */
    ReprAs_Float: _AuxReprConversions.ReprAs_Float.bind(this),
    /**
     * Конвертирует runtime-значение в UTF-8 строку.
     * 
     * *Значение* -> __*Представление*__
     * @param {llval_ty} Rtvalue
     * @returns {string | never}
     * @see {@link _AuxReprConversions.ReprAs_String() source}
     */
    ReprAs_String: _AuxReprConversions.ReprAs_String.bind(this),

    /**
     * Специализированный `IStack#pop()`, который автоматически преобразует
     * *значение* в *представление* типа Integer.
     * 
     * Проверка длины стека - на вашей совести!
     * @returns 
     */
    PopValue_Integer: () =>
      this.aux.ReprAs_Integer(this.Stack.pop()),
    /**
     * Специализированный `IStack#pop()`, который автоматически преобразует
     * *значение* в *представление* типа Float.
     * 
     * Проверка длины стека - на вашей совести!
     * @returns 
     */
    PopValue_Float: () =>
      this.aux.AsFloat(this.Stack.pop()),
    /**
     * Специализированный `IStack#pop()`, который автоматически преобразует
     * *значение* в *представление* типа Float.
     * 
     * Проверка длины стека - на вашей совести!
     * @returns 
     */
    PopValue_String: () =>
      this.aux.AsString(this.Stack.pop()),
  };

  /**
   * Интерпретируемое в данный момент слово.
   * @type {string}
   */
  CurrentInterpretingWord = ""; //Ответственность закреплена за 'RecursiveInterpret'
}



/**
 * Поток СЛОВ.
 * Специализирован под LLL.
 */
export class _WordStream {
  #LineIndex = 0;
  get LineIndex() {
    return this.#LineIndex;
  }

  /** @type {string[]} */
  #Lines = [];

  /** @type {string[]} */
  #CurrentLine = [];

  /**
   * @param {string} AllCode 
   */
  constructor(AllCode) {
    this.#Lines = AllCode.split(/\r?\n/);
  }

  /**
   * Берёт текущий символ (со сдвигом потока).
   * 
   * Проверка конца кода на вашей совести!
   * @returns {string}
   */
  tkGrab() {
    //@ts-ignore
    return this.#CurrentLine.shift();
  }

  /**
   * Проверяет наличие слов в `#CurrentLine`,
   * иначе - дополняет **с вырезанием комментариев и лишних пробелов**
   * @returns {boolean} НЕ достигнут ли конец кода?
   * @mutates
   */
  tkRefillLineBuff() {
    if (this.#EndOfCode()) return false;
    if (this.#CurrentLine.length == 0) {
      let RawLine = this.#Lines[this.#LineIndex];
      RawLine = _PrepareCodeLine(RawLine);
      this.#LineIndex++;
      if (RawLine.length == 0) return this.tkRefillLineBuff();

      this.#CurrentLine = RawLine.split(/\s/).filter(word => word != "");
      return true;
    }
    return true;
  }

  /**
   * Больше кода нету?
   */
  #EndOfCode() {
    return this.#LineIndex == this.#Lines.length
      && this.#CurrentLine.length == 0;
  }
}



/** Начало комментария */
const TK_COMMENT_START = ";";

/**
 * Вырезает комментарии, лишние пробелы и т.д.
 * @param {string} Line 
 * @returns {string}
 */
export function _PrepareCodeLine(Line) {
  return Line
    .split(TK_COMMENT_START, 1)[0] //строчные комментарии
    .replaceAll(/\(.*?\)/g, '') //встраиваемые комментарии
    .replaceAll(/( )+/g, ' ') //двойные пробелы
    .trim(); //лишние пробелы в начале/конце
}
