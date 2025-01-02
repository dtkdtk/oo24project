import { IsInteger } from "../Utils.js";

/**
 * @param {llrepr_ANY_ty} Repr
 * @returns {llval_ty}
 */
export function RtvalueOf(Repr) {
  if (typeof Repr == "number")
    return RtvalueOf_Number(Repr);
  else if (typeof Repr == "string")
    return RtvalueOf_String(Repr);
  else
    throw new TypeError(`Unknown representation.\n\tSupported: 'number', 'string'\n\tGot: '${typeof Repr}'`);
}

/**
 * @param {number} NumRepr 
 * @returns {llval_ty}
 */
export function RtvalueOf_Number(NumRepr) {
  if (IsInteger(NumRepr)) {
    const View = new BigInt64Array(1);
    View[0] = BigInt(NumRepr);
    return View.buffer;
  }
  else { //=> float
    const View = new Float64Array(1);
    View[0] = NumRepr;
    return View.buffer;
  }
}
/**
 * @param {string} StrRepr 
 * @returns {llval_ty}
 */
export function RtvalueOf_String(StrRepr) {
  const Encoder = new TextEncoder();
  //@ts-ignore ((возвращает ИСХОДНЫЙ буфер, а мы положили ровно то, что нам надо))
  return Encoder.encode(StrRepr).buffer;
}



/**
 * @param {llval_ty} Rtvalue
 * @returns {number | never}
 * @this {LLL_STATE}
 */
export function ReprAs_Integer(Rtvalue) {
  const View = new BigInt64Array(Rtvalue);
  if (View.length > 1)
    return this.aux.ThrowRuntimeExc_At(this.CurrentInterpretingWord, `Expected Integer number, received '0x${Buffer.from(Rtvalue).toString("hex")}'.`);

  const Num = Number(View[0]);
  if (isNaN(Num))
    return this.aux.ThrowRuntimeExc_At(this.CurrentInterpretingWord, `The given value cannot be converted to Integer.`);
  if (!IsInteger(Num))
    return this.aux.ThrowRuntimeExc_At(this.CurrentInterpretingWord, `Expected Integer number, received Float number.`);
  return Num;
}
/**
 * @param {llval_ty} Rtvalue
 * @returns {number | never}
 * @this {LLL_STATE}
 */
export function ReprAs_Float(Rtvalue) {
  const View = new Float64Array(Rtvalue);
  if (View.length > 1)
    return this.aux.ThrowRuntimeExc_At(this.CurrentInterpretingWord, `Expected Float number, received '0x${Buffer.from(Rtvalue).toString("hex")}'.`);

  const Num = Number(View[0]);
  if (isNaN(Num))
    return this.aux.ThrowRuntimeExc_At(this.CurrentInterpretingWord, `The given value cannot be converted to Float.`);
  return Num;
}
/**
 * @param {llval_ty} Rtvalue
 * @returns {string | never}
 * @this {LLL_STATE}
 */
export function ReprAs_String(Rtvalue) {
  const Decoder = new TextDecoder("utf8");
  return Decoder.decode(Rtvalue);
}
