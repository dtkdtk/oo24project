declare type LLL_STATE = import("./TheMachine.js").LLL_STATE;
declare type TheReader = import("./TheMachine.js").TheReader;
declare type CodeFragment = import("./TheMachine.js").CodeFragment;
declare type LoopBodyFragment = import("./TheMachine.js").LoopBodyFragment;

declare type NativeJsFunction = (S: LLL_STATE) => unknown;
declare type IntSize = 1 | 2 | 4 | 8;

declare type KnownExceptionClass =
  | "LLL SyntaxError" //программист допустил ошибку в синтаксисе кода
  | "LLL RuntimeError" //программист допустил ошибку в рантайме (не обнаружить при компиляции)
  | "LLL RuntimeException" //нечто неожиданное, непредусмотренное
declare type KnownExceptionCode =
  | keyof typeof import("./Errors.js").Errors;
declare type KnownWarningCode =
  | keyof typeof import("./Errors.js").Warnings;



declare type LLL_Value = string | number; //Доступные в данный момент типы значений
declare type LLL_Definition = LLL_Value | NativeJsFunction | CodeFragment;
declare type Dictionary = Map<string, LLL_Definition>;
declare type ConstDict = ReadonlyMap<string, LLL_Definition>;
