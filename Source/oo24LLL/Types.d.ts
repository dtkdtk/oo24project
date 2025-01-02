declare type LLL_STATE = import("./TheMachine.js").LLL_STATE;
declare type WordStream = import("./TheMachine.js")._WordStream;

declare type NativeJsFunction = (S: LLL_STATE, ws: WordStream) => unknown;
declare type IntSize = 1 | 2 | 4 | 8;



declare type llval_ty = ArrayBuffer;

//Границы между размерами чисел, а также между int & float стираются в JS.
//Придётся использовать армию ассертов.
declare type llrepr_int_ty = number;
declare type llrepr_float_ty = number;

//А вот строки будут "нативными".
declare type llrepr_string_ty = string;
declare type llrepr_ANY_ty = llrepr_int_ty | llrepr_float_ty | llrepr_string_ty;

declare type lldefinition_u = llval_ty | NativeJsFunction | WordStream;
