declare type LLL_STATE = import("./TheMachine.js").LLL_STATE;
declare type TheReaderStream = import("./TheMachine.js").TheReaderStream;
declare type WordDefinitionFragment = import("./TheMachine.js").WordDefinitionFragment;

declare type NativeJsFunction = (S: LLL_STATE) => unknown;
declare type IntSize = 1 | 2 | 4 | 8;
declare type _KnownExceptionClasses = "LLL RuntimeException";


declare type LLL_Value = string | number; //Доступные в данный момент типы значений
declare type LLL_Definition = LLL_Value | NativeJsFunction | WordDefinitionFragment;
declare type LLL_Dictionary = Map<string, LLL_Definition>;
declare type LLL_ConstDict = ReadonlyMap<string, LLL_Definition>;
