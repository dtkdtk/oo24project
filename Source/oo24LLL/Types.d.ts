declare type LLL_STATE = import("./TheMachine.js").LLL_STATE;
declare type TheReaderStream = import("./TheMachine.js").TheReaderStream;
declare type WordDefinitionFragment = import("./TheMachine.js").WordDefinitionFragment;

declare type NativeJsFunction = (S: LLL_STATE, ws: TheReaderStream) => unknown;
declare type IntSize = 1 | 2 | 4 | 8;



//Конвертации между сырыми бинарными значениями и рантайм-представлениями от JS
// слишком ресурсоёмкие (проверено бенчмарками). Это вам не натив.
//Поэтому, начиная с версии v0.0.3, будут использоваться примитивные рантайм-типы JS.
// (банально ввиду их скорости)
declare type llval_ty = unknown;

//Границы между размерами чисел, а также между int & float стираются в JS.
declare type llrepr_number_ty = number;

//А вот строки будут "нативными".
declare type llrepr_string_ty = string;
declare type llrepr_ANY_ty = llrepr_number_ty | llrepr_string_ty;

declare type lldefinition_u = llval_ty | NativeJsFunction | WordDefinitionFragment;
