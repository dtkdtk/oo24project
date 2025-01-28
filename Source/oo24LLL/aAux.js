import { GetStateTrace } from "./AuxStateTrace.js";

export * from "./AuxStateTrace.js";
export * from "./AuxReprConversions.js";

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
  S.StdERR(`LLL Runtime exception: (${S.TheReader.LineIndex}:${S.TheReader.Column})${S.AdditionalLocationInfo ?? ''} ${Msg}\n\tScript path: '${S.ScriptFullPath}'\n\n`);
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
