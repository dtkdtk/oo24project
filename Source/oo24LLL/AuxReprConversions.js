import * as aux from "./aAux.js";

/**
 * Конвертирует указанное представление в runtime-значение.
 * 
 * *Представление* -> __*Значение*__
 * @param {LLL_STATE} S
 * @param {llrepr_ANY_ty} Repr
 * @returns {llval_ty}
 */
export function RtvalueOf(S, Repr) {
  return Repr; //забавно, не так ли?
  //заглушка под натив.
}

/**
 * Специализация {@link RtvalueOf()} для чисел (тип `Integer|Float`).
 * 
 * *Представление* -> __*Значение*__
 * @param {LLL_STATE} S
 * @param {llrepr_number_ty} NumRepr 
 * @returns {llval_ty}
 */
export function RtvalueOf_Number(S, NumRepr) {
  return NumRepr;
  //заглушка под натив.
}

/**
 * Специализация {@link RtvalueOf()} для строк (тип `String`).
 * 
 * *Представление* -> __*Значение*__
 * @param {LLL_STATE} S
 * @param {llrepr_string_ty} StrRepr 
 * @returns {llval_ty}
 */
export function RtvalueOf_String(S, StrRepr) {
  return StrRepr;
  //заглушка под натив.
}

/**
 * ПЫТАЕТСЯ конвертировать runtime-значение в число (тип `Integer|Float`).
 * Если не получается - возвращает `null` вместо ошибки.
 * 
 * *Значение* -> __*Представление*__
 * @param {LLL_STATE} S 
 * @param {llval_ty} Rtvalue 
 * @returns {llrepr_number_ty | null}
 */
export function MaybeReprAs_Number(S, Rtvalue) {
  if (typeof Rtvalue == "number")
    return Rtvalue;

  const AsNumber = Number(Rtvalue);
  if (isNaN(AsNumber))
    return null;
  return AsNumber;
}



/**
 * Конвертирует runtime-значение в число (тип `Integer|Float`).
 * 
 * *Значение* -> __*Представление*__
 * @param {LLL_STATE} S
 * @param {llval_ty} Rtvalue
 * @returns {llrepr_number_ty | never}
 */
export function ReprAs_Number(S, Rtvalue) {
  const AsNumber = MaybeReprAs_Number(S, Rtvalue);
  if (AsNumber === null)
    return aux.ThrowRuntimeExc_Here(S, `The given value cannot be converted to Integer.`);;
  return AsNumber;
}

/**
 * Конвертирует runtime-значение в UTF-8 строку (тип `String`).
 * 
 * *Значение* -> __*Представление*__
 * @param {LLL_STATE} S
 * @param {llval_ty} Rtvalue
 * @returns {llrepr_string_ty}
 */
export function ReprAs_String(S, Rtvalue) {
  return String(Rtvalue);
}



/**
 * Специализированный `IStack#pop()`, который автоматически преобразует
 * *значение* в *представление* типа `Integer|Float`.
 * 
 * Проверка длины стека - на вашей совести!
 * @param {LLL_STATE} S
 * @returns {llrepr_number_ty}
 */
export function Pop_Number(S) {
  return ReprAs_Number(S, S.Stack.pop());
}

/**
 * Специализированный `IStack#pop()`, который автоматически преобразует
 * *значение* в *представление* типа String.
 * 
 * Проверка длины стека - на вашей совести!
 * @param {LLL_STATE} S
 * @returns {llrepr_string_ty}
 */
export function Pop_String(S) {
  return ReprAs_String(S, S.Stack.pop());
}
