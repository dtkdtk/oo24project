import * as aux from "./aAux.js";

/**
 * ПЫТАЕТСЯ конвертировать runtime-значение в число (тип `Integer|Float`).
 * Если не получается - возвращает `null` вместо ошибки.
 * 
 * @param {LLL_STATE} S 
 * @param {LLL_Value} Value 
 * @returns {number | null}
 */
export function MaybeAs_Number(S, Value) {
  if (typeof Value == "number")
    return Value;

  const AsNumber = Number(Value);
  if (isNaN(AsNumber))
    return null;
  return AsNumber;
}



/**
 * Конвертирует runtime-значение в число (тип `Integer|Float`).
 * 
 * @param {LLL_STATE} S
 * @param {LLL_Value} Rtvalue
 * @returns {number | never}
 */
export function As_Number(S, Rtvalue) {
  const AsNumber = MaybeAs_Number(S, Rtvalue);
  if (AsNumber === null)
    aux.ThrowRuntimeException(S, "XM_1003", Rtvalue);
  return AsNumber;
}

/**
 * Конвертирует runtime-значение в UTF-8 строку (тип `String`).
 * 
 * @param {LLL_STATE} S
 * @param {LLL_Value} Rtvalue
 * @returns {string}
 */
export function As_String(S, Rtvalue) {
  return String(Rtvalue);
}



/**
 * Специализированный `IStack#pop()`, который автоматически преобразует
 * *значение* в *представление* типа `Integer|Float`.
 * 
 * Проверка длины стека - на вашей совести!
 * @param {LLL_STATE} S
 * @returns {number}
 */
export function Pop_Number(S) {
  return As_Number(S, S.Stack.pop());
}

/**
 * Специализированный `IStack#pop()`, который автоматически преобразует
 * *значение* в *представление* типа String.
 * 
 * Проверка длины стека - на вашей совести!
 * @param {LLL_STATE} S
 * @returns {string}
 */
export function Pop_String(S) {
  return As_String(S, S.Stack.pop());
}
