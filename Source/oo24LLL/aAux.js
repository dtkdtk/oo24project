import { GetStateTrace } from "./AuxStateTrace.js";
import { Errors } from "./Errors.js";

export * from "./AuxStateTrace.js";
export * from "./AuxTyping.js";

/* Суффикс '_' у имён функций означает, что они не принимают параметр 'S: LLL_STATE'
|  - т.е. являются "абстрактными", не зависящами от контекста. */



/**
 * @template {KnownExceptionCode} _ECodeTy
 * @param {LLL_STATE} S 
 * @param {_ECodeTy} ECode 
 * @param {Parameters<(typeof Errors)[_ECodeTy]>} Args 
 * @returns {never}
 */
export function ThrowRuntimeException(S, ECode, ...Args) {
  /** @type {(...args: any[]) => string} */
  const Fn = Errors[ECode];
  _ThrowException(S, "LLL RuntimeException", ECode, Fn(...Args));
}

/**
 * @template {KnownExceptionCode} _ECodeTy
 * @param {LLL_STATE} S 
 * @param {_ECodeTy} ECode 
 * @param {Parameters<(typeof Errors)[_ECodeTy]>} Args 
 * @returns {never}
 */
export function ThrowRuntimeError(S, ECode, ...Args) {
  /** @type {(...args: any[]) => string} */
  const Fn = Errors[ECode];
  _ThrowException(S, "LLL RuntimeError", ECode, Fn(...Args));
}

/**
 * @template {KnownExceptionCode} _ECodeTy
 * @param {LLL_STATE} S 
 * @param {_ECodeTy} ECode 
 * @param {Parameters<(typeof Errors)[_ECodeTy]>} Args 
 * @returns {never}
 */
export function ThrowSyntaxError(S, ECode, ...Args) {
  /** @type {(...args: any[]) => string} */
  const Fn = Errors[ECode];
  _ThrowException(S, "LLL SyntaxError", ECode, Fn(...Args));
}

/**
 * Отправляет предупреждение в `stderr`.
 * @template {KnownExceptionCode} _ECodeTy
 * @param {LLL_STATE} S 
 * @param {_ECodeTy} ECode 
 * @param {Parameters<(typeof Errors)[_ECodeTy]>} Args 
 */
export function EmitWarning(S, ECode, ...Args) {
  /** @type {(...args: any[]) => string} */
  const Fn = Errors[ECode];
  const Msg = Fn(...Args);
  S.StdERR(`LLL Warning: ${Msg}` + _GetErrAppendix(S) + `\t\nErrCode: [${ECode}]` + "\n");
}

/**
 * @param {LLL_STATE} S
 * @param {KnownExceptionClass} EClass
 * @param {KnownExceptionCode} ECode 
 * @param {string} Msg
 * @returns {never}
 */
function _ThrowException(S, EClass, ECode, Msg) {
  /* Обратите внимание: Здесь мы не имеем права пользоваться
  |  всякими 'throw' / 'process.exit()' - используем вместо этого
  |  'LLL_STATE#_ErrorHandler()'.
  А ещё, вместо 'console.*' используем 'LLL_STATE#Std(OUT/ERR)'. */
  S.StdERR(`${EClass}: ${Msg}` + _GetErrAppendix(S) + `\t\nErrCode: [${ECode}]` + "\n");
  S.StdERR(GetStateTrace(S));
  S.StdERR("\n\n");
  S._ExceptionHandler(EClass);
}

/**
 * Возвращает аппендикс ошибки. В нём содержится информация об ошибке (скрипт, строка, столбец и т.д.)
 * @param {LLL_STATE} S 
 * @returns {string}
 */
function _GetErrAppendix(S) {
  return `\n\tScript path: '${S.ScriptFullPath}'`
    + `\n\tLine: ${S.TheReader.LineIndex}`
    + `\n\tColumn: ${S.TheReader.Column}`
    + (S.AdditionalLocationInfo ? "\n\tAddit.Location: " + S.AdditionalLocationInfo : '')
    + `\n`;
}



/**
 * Проверяет условие. Если ложно - выкидывает указанное исключение / ошибку.
 * @template {KnownExceptionCode} _ECodeTy
 * @param {LLL_STATE} S
 * @param {unknown} Condition 
 * @param {KnownExceptionClass} EClass
 * @param {_ECodeTy} ECode 
 * @param {Parameters<(typeof Errors)[_ECodeTy]>} Args 
 * @returns {asserts Condition}
 */
export function Assert(S, Condition, EClass, ECode, ...Args) {
  if (Condition) return;
  /** @type {(...args: any[]) => string} */
  const Fn = Errors[ECode];
  _ThrowException(S, EClass, ECode, Fn(...Args));
}



/**
 * Проверяет, достаточно ли значений в стеке.
 * @param {LLL_STATE} S
 * @param {number} Needed
 * @returns {void | never}
 */
export function AssertStackLength(S, Needed) {
  if (S.Stack.length < Needed)
    ThrowRuntimeException(S, "ERT_1002", Needed, S.Stack.length);
}



/**
 * Обрабатывает экранирвоание символов (а также спец.символы вроде '\n').
 * 
 * В данный момент поддерживаются следующие спец.символы:
 * - `\r` (возврат каретки; для совместимости с форматом конца строки "CRLF")
 * - `\n` (переход на новую строку)
 * - `\t` (символ табуляции)
 * - `\\` (обратный слеш)
 * - `\<перевод_строки>` (отменяет перевод строки)
 * @param {LLL_STATE} S 
 * @param {string} AllCode 
 * @returns {string} обработанная строка
 */
export function HandleCharacterEscaping(S, AllCode) {
  let NewCode = "";
  let PreviousIndex = 0;
  theLoop: while (true) {
    const MatchIndex = AllCode.indexOf("\\", PreviousIndex + 2);
    if (MatchIndex == -1) break;
    if (MatchIndex + 1 == AllCode.length)
      ThrowRuntimeException(S, "XM_1001");
    NewCode += AllCode.slice(PreviousIndex, MatchIndex);
    PreviousIndex = MatchIndex;
    switch (AllCode[MatchIndex + 1]) {
      case "r":
        NewCode += "\r";
        continue theLoop;
      case "n":
        NewCode += "\n";
        continue theLoop;
      case "t":
        NewCode += "\t";
        continue theLoop;
      case "0":
        NewCode += "\0";
        continue theLoop;
      case "\\":
        NewCode += "\\";
        continue theLoop;
      case "\n":
        continue theLoop;
      case "\r":
        if (AllCode[MatchIndex + 2] == "\n")
        AllCode = AllCode.slice(MatchIndex + 3);
        continue theLoop;
      default:
        ThrowRuntimeException(S, "XM_1002", AllCode[MatchIndex + 1]);
    }
  }
  NewCode += AllCode.slice(PreviousIndex, AllCode.length);
  return NewCode;
}



/**
 * Смешивает словари.
 * Если слова повторяются - выбирается то, что будет в последем словаре.
 * @param {...Dictionary} Dicts 
 * @returns {Dictionary}
 */
export function MergeDictionaries_(...Dicts) {
  const ResultingEntries = [];
  for (const Dict of Dicts) {
    const Entries = Array.from(Dict.entries());
    ResultingEntries.push(...Entries);
  }
  return new Map(ResultingEntries);
}



/**
 * Убирает кавычки с начала и с конца строки.
 * @param {string} Target 
 * @returns {string}
 */
export function Unquote_(Target) {
  if (Target.length <= 2) return "";
  return Target.slice(1, Target.length - 1);
}
