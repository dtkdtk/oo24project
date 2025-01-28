declare type LLL_STATE = import("./TheMachine.js").LLL_STATE;
declare type TheReaderStream = import("./TheMachine.js").TheReaderStream;
declare type WordDefinitionFragment = import("./TheMachine.js").WordDefinitionFragment;

declare type NativeJsFunction = (S: LLL_STATE) => unknown;
declare type IntSize = 1 | 2 | 4 | 8;
declare type _KnownExceptionClasses = "LLL RuntimeException";


declare type llval_t = string | number; //Доступные в данный момент типы значений
declare type lldefinition_u = llval_t | NativeJsFunction | WordDefinitionFragment;
