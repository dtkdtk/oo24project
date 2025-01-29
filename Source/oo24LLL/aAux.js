import { GetStateTrace } from "./AuxStateTrace.js";

export * from "./AuxStateTrace.js";
export * from "./AuxTyping.js";

/* Суффикс '_' у имён функций означает, что они не принимают параметр 'S: LLL_STATE'
 - т.е. являются "абстрактными", не зависящами от контекста. */



/**
 * Выбрасывает RuntimeException.
 * @param {LLL_STATE} S
 * @param {string} Msg
 * @returns {never}
 */
export function ThrowRuntimeExc(S, Msg) {
  /* Обратите внимание: Здесь мы не имеем права пользоваться
   всякими 'throw' / 'process.exit()' - используем вместо этого
   'LLL_STATE#_ErrorHandler()'.
  А ещё, вместо 'console.*' используем 'LLL_STATE#Std(OUT/ERR)'. */
  S.StdERR(`LLL Runtime exception: ${Msg}\n\tScript path: '${S.ScriptFullPath}'\n\tLine: ${S.TheReader.LineIndex}\n\tColumn: ${S.TheReader.Column}${S.AdditionalLocationInfo ? "\n\tAddit.Location: " + S.AdditionalLocationInfo : ''}\n\n`);
  S.StdERR(GetStateTrace(S));
  S.StdERR("\n\n");
  S._ExceptionHandler("LLL RuntimeException");
}



/**
 * @param {LLL_STATE} S
 * @param {unknown} Condition 
 * @param {string} ErrorMsg 
 * @returns {asserts Condition is true}
 */
export function Assert(S, Condition, ErrorMsg) {
  if (!Condition)
  ThrowRuntimeExc(S, ErrorMsg);
}



/**
 * Проверяет, достаточно ли значений в стеке.
 * @param {LLL_STATE} S
 * @param {number} Needed
 * @returns {void | never}
 */
export function AssertStackLength(S, Needed) {
  if (S.Stack.length < Needed)
  ThrowRuntimeExc(S, "Not enough values on stack."
    + `\n\tExpected: '${Needed}'\n\tGot: '${S.Stack.length}'`);
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
      ThrowRuntimeExc(S, `Expected escape character, got end of string`);
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
        ThrowRuntimeExc(S, `Non-existent special character: '\\${AllCode[MatchIndex + 1]}'`);
    }
  }
  NewCode += AllCode.slice(PreviousIndex, AllCode.length);
  return NewCode;
}



/**
 * Смешивает словари.
 * Если слова повторяются - выбирается то, что будет в последем словаре.
 * @param {...LLL_Dictionary} Dicts 
 * @returns {LLL_Dictionary}
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
