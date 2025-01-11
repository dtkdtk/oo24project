
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
  console.error("LLL Runtime exception: " + Msg + "\n");
  console.error(GetStateTrace(S));
  throw "LLL RuntimeException";
}

/**
 * Специализация {@link ThrowRuntimeExc()} с пояснением места, где возникла ошибка.
 * @param {LLL_STATE} S
 * @param {string} Where 
 * @param {string} Msg 
 * @returns {never}
 */
export function ThrowRuntimeExc_At(S, Where, Msg) {
  ThrowRuntimeExc(S, `'${Where}': ${Msg}`);
}

/**
 * Специализация {@link ThrowRuntimeExc_At()}, которая автоматически указывает
 * интерпретируемое в данный момент слово как место ошибки.
 * @param {LLL_STATE} S
 * @param {string} Msg 
 * @returns {never}
 */
export function ThrowRuntimeExc_Here(S, Msg) {
  ThrowRuntimeExc(S, `'${S.CurrentInterpretingWord}': ${Msg}`);
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
 * Специализация {@link Assert()} с пояснением места, где выполняется ассерт.
 * @param {LLL_STATE} S
 * @param {string} Where 
 * @param {unknown} Condition 
 * @param {string} ErrorMsg 
 * @returns {asserts Condition is true}
 */
export function Assert_At(S, Where, Condition, ErrorMsg) {
  if (!Condition)
  ThrowRuntimeExc_At(S, Where, ErrorMsg);
}

/**
 * Специализация {@link Assert_At()}, которая автоматически указывает
 * интерпретируемое в данный момент слово как место ошибки.
 * @param {LLL_STATE} S
 * @param {unknown} Condition 
 * @param {string} ErrorMsg 
 * @returns {asserts Condition is true}
 */
export function Assert_Here(S, Condition, ErrorMsg) {
  Assert_At(S, S.CurrentInterpretingWord, Condition, ErrorMsg);
}

/**
 * Проверяет, достаточно ли значений в стеке.
 * @param {LLL_STATE} S
 * @param {number} Needed
 * @returns {void | never}
 */
export function AssertStackLength(S, Needed) {
  if (S.Stack.length < Needed)
  ThrowRuntimeExc_At(S, S.CurrentInterpretingWord, "Not enough values on stack."
    + `\n\tExpected '${Needed}', stack contains '${S.Stack.length}'.`);
}
