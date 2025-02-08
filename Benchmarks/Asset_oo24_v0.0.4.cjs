var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Source/include.js
var include_exports = {};
__export(include_exports, {
  As_Number: () => As_Number,
  As_String: () => As_String,
  Assert: () => Assert,
  AssertStackLength: () => AssertStackLength,
  ClampNumber: () => ClampNumber,
  ClampToLength: () => ClampToLength,
  CodeFragment: () => CodeFragment,
  CompleteToLength: () => CompleteToLength,
  Constrct: () => Constrct,
  EmitWarning: () => EmitWarning,
  FitStringsInLength: () => FitStringsInLength,
  GetStateTrace: () => GetStateTrace,
  HandleCharacterEscaping: () => HandleCharacterEscaping,
  INSTR_END_OF_BLOCK: () => INSTR_END_OF_BLOCK,
  IStack: () => IStack,
  Instr: () => Instr,
  IsInteger: () => IsInteger,
  LLL_EXECUTE: () => LLL_EXECUTE,
  LLL_STATE: () => LLL_STATE,
  Labelled: () => Labelled,
  MakeIntrinsic: () => MakeIntrinsic,
  MaybeAs_Number: () => MaybeAs_Number,
  MergeDictionaries_: () => MergeDictionaries_,
  OmitKeysFrom: () => OmitKeysFrom,
  Pop_Number: () => Pop_Number,
  Pop_String: () => Pop_String,
  Prelude: () => Prelude,
  RemoveSuffix: () => RemoveSuffix,
  TK_COMMENT_LINE_START_A: () => TK_COMMENT_LINE_START_A,
  TK_COMMENT_LINE_START_B: () => TK_COMMENT_LINE_START_B,
  TK_INLINE_COMMENT_END: () => TK_INLINE_COMMENT_END,
  TK_INLINE_COMMENT_START: () => TK_INLINE_COMMENT_START,
  TK_NOMINAL_STRING: () => TK_NOMINAL_STRING,
  TK_SCOPE_SEPARATOR: () => TK_SCOPE_SEPARATOR,
  TK_VIRTUAL_STRING: () => TK_VIRTUAL_STRING,
  TheReader: () => TheReader,
  ThrowRuntimeError: () => ThrowRuntimeError,
  ThrowRuntimeException: () => ThrowRuntimeException,
  ThrowSyntaxError: () => ThrowSyntaxError,
  Unquote_: () => Unquote_,
  __Any: () => __Any
});
module.exports = __toCommonJS(include_exports);

// Source/Utils-typed.js
var IStack = class _IStack extends Array {
  static createSized(size) {
    return new _IStack(size);
  }
  static createAndFill(...values) {
    const S = new _IStack();
    S.push(...values);
    return S;
  }
  static createFrom(original) {
    const S = new _IStack();
    S.push(...original);
    return S;
  }
  static create() {
    return new _IStack();
  }
  peek() {
    return this[this.length - 1];
  }
  push(...values) {
    super.push(...values);
    return this;
  }
};
var __Any = void 0;
function Labelled(xLabel, Origin) {
  Origin.xLabel = xLabel;
  return Origin;
}

// Source/Utils.js
function OmitKeysFrom(Source, ...Keys) {
  const Buf = {};
  for (const K in Source)
    if (!Keys.includes(K))
      Buf[K] = Source[K];
  return Buf;
}
function CompleteToLength(TargetLength, Str, Position = "PREFIX") {
  let ToAppend = "";
  const Needed = TargetLength - Str.length;
  if (Needed < 0) {
    console.warn(`INTERNAL BUG: 'Source/Utils: CompleteToLength()': Given Str length greater than TargetLength.`);
    return Str;
  }
  if (Needed > 0)
    ToAppend += " ".repeat(Needed);
  if (Position == "PREFIX")
    return ToAppend + Str;
  else
    return Str + ToAppend;
}
function ClampToLength(TargetLength, Str) {
  let Buf = Str;
  if (Str.length > TargetLength)
    Buf = Buf.slice(0, TargetLength - 2) + "\u2026";
  return Buf;
}
function ClampNumber(Min, Max, Given) {
  if (Given < Min) return Min;
  if (Given > Max) return Max;
  return Given;
}
ClampNumber.OnlyMin = function(Min, Given) {
  if (Given < Min) return Min;
  return Given;
};
ClampNumber.OnlyMax = function(Max, Given) {
  if (Given > Max) return Max;
  return Given;
};
function FitStringsInLength(Strings, TargetLength, DelimiterLength = 0) {
  if (Strings.length == 0) return [];
  const Buf = [[]];
  for (const Str of Strings) {
    const CurrentLength = Buf[Buf.length - 1].reduce((accum, cur) => accum + cur.length, 0) + Buf[Buf.length - 1].length * DelimiterLength;
    if (CurrentLength + Str.length > TargetLength)
      Buf.push([Str]);
    else
      Buf[Buf.length - 1].push(Str);
  }
  return Buf;
}
function RemoveSuffix(Str, Suffix) {
  const Index = Str.lastIndexOf(Suffix);
  if (Index == -1)
    return Str;
  else
    return Str.slice(0, Index);
}
function IsInteger(maybeInteger) {
  return ~~maybeInteger == maybeInteger;
}

// Source/oo24LLL/AuxStateTrace.js
var TARGET_TERMINAL_WIDTH = 60;
GetStateTrace.Location = function(S) {
  let Buf = "	";
  Buf += S.PseudoScope.join("/") || "<top-level>";
  Buf += "\n";
  return Buf;
};
GetStateTrace.Stack = function(S) {
  let Buf = "";
  if (S.Stack.length == 0) {
    Buf += "	<empty>\n";
    return Buf;
  }
  const MaxIndex = S.Stack.length - 1;
  const IndexLength = ClampNumber.OnlyMin(3, MaxIndex.toString().length);
  Buf += "	TOP| ";
  Buf += ClampToLength(TARGET_TERMINAL_WIDTH, _Represent(S, S.Stack.peek()).toString());
  Buf += "\n";
  for (let i = S.Stack.length - 2; i >= 0; i--) {
    Buf += "	";
    Buf += CompleteToLength(IndexLength, (i - MaxIndex).toString());
    Buf += "| ";
    Buf += ClampToLength(TARGET_TERMINAL_WIDTH, _Represent(S, S.Stack[i]).toString());
    Buf += "\n";
  }
  return Buf;
};
GetStateTrace.Dict = function(S) {
  let Buf = "";
  if (S.UserDict.size == 0) {
    Buf += "	<empty>\n";
    return Buf;
  }
  const IndexDisplay = "	| ";
  const Words = Array.from(S.UserDict.keys());
  const WordsMosaic = FitStringsInLength(Words, TARGET_TERMINAL_WIDTH, 1);
  Buf += IndexDisplay;
  Buf += WordsMosaic.map((it) => it.join(" ")).join("\n" + IndexDisplay);
  Buf += "\n";
  return Buf;
};
GetStateTrace.ScriptMetadata = function(S) {
  let Buf = "";
  const Entries = Object.entries(S.ScriptMetadata);
  if (Entries.length == 0) {
    Buf += "	<empty>\n";
    return Buf;
  }
  const MaxIndex = Entries.length - 1;
  const IndexLength = MaxIndex.toString().length;
  const MaxKeyLength = [...Entries].sort(([keyA], [keyB]) => keyB.length - keyA.length)[0][0].length;
  for (let i = 0; i < Entries.length; i++) {
    const [Key, Value] = Entries[i];
    Buf += "	";
    Buf += CompleteToLength(IndexLength, i.toString());
    Buf += "| ";
    Buf += CompleteToLength(MaxKeyLength, Key);
    Buf += " | ";
    Buf += ClampToLength(TARGET_TERMINAL_WIDTH - MaxKeyLength, As_String(S, Value));
    Buf += "\n";
  }
  return Buf;
};
GetStateTrace.StringsTable = function(S) {
  let Buf = "";
  if (S.StringsTable.length == 0) {
    Buf += "	<empty>\n";
    return Buf;
  }
  const MaxIndex = S.StringsTable.length - 1;
  const IndexLength = MaxIndex.toString().length;
  for (let i = 0; i < S.StringsTable.length; i++) {
    Buf += "	";
    Buf += CompleteToLength(IndexLength, i.toString());
    Buf += "| ";
    Buf += ClampToLength(TARGET_TERMINAL_WIDTH, S.StringsTable[i]);
    Buf += "\n";
  }
  return Buf;
};
function GetStateTrace(S) {
  return "Current interpreter's state:\n> Location:\n" + GetStateTrace.Location(S) + "> Stack:\n" + GetStateTrace.Stack(S) + "> Dictionary:\n" + GetStateTrace.Dict(S) + "> ScriptMetadata:\n" + GetStateTrace.ScriptMetadata(S) + "> StringsTable:\n" + GetStateTrace.StringsTable(S) + "--\n";
}
function _Represent(S, Rtvalue) {
  return MaybeAs_Number(S, Rtvalue) ?? As_String(S, Rtvalue);
}

// Source/oo24LLL/CommonGrammar.js
var TK_COMMENT_LINE_START_A = ";";
var TK_COMMENT_LINE_START_B = "#";
var TK_NOMINAL_STRING = "`";
var TK_VIRTUAL_STRING = '"';
var TK_INLINE_COMMENT_START = "(";
var TK_INLINE_COMMENT_END = ")";
var TK_SCOPE_SEPARATOR = "@@-";
var INSTR_END_OF_BLOCK = "...END";
var Prelude = {
  /** @readonly */
  EXPLICIT_START_PRELUDE: "PRELUDE...",
  /** @readonly */
  EXPLICIT_END_PRELUDE: "...END_PRELUDE",
  /** @readonly */
  META: "META",
  /** @readonly */
  STRTABLE_START: "STRINGS_TABLE...",
  /** @readonly */
  STRTABLE_ELEMENT_START: "^START",
  /** @readonly */
  STRTABLE_ELEMENT_END: "^END",
  /** @readonly */
  STRTABLE_END: "...END_TABLE"
};
var Instr = {
  /** @readonly */
  DEFINE_VAR: "DEFINE",
  /** @readonly */
  DELETE_DEFINITION: "DELETE",
  /** @readonly */
  LOOP_BREAK: "BREAK_LOOP",
  /** @readonly */
  LOOP_RESTART: "SKIP_ITERATION",
  /** @readonly */
  EnterScope: MakeIntrinsic("EnterScope"),
  /** @readonly */
  ExitScope: MakeIntrinsic("ExitScope"),
  /** @readonly */
  ExecuteCondition: MakeIntrinsic("ExecuteCondition")
};
var Constrct = {
  /** @readonly */
  DEFINE_FUNC: "DEFINE...",
  /** @readonly */
  CONDITION_THEN: "THEN...",
  /** @readonly */
  CONDITION_ELSE: "ELSE...",
  /** @readonly */
  LOOP: "LOOP..."
};
function MakeIntrinsic(Sym) {
  return "@__" + Sym + "__@";
}

// Source/oo24LLL/Errors.js
var Errors = {
  /*====== ERRORS ======*/
  /* ESX - Error SyntaX (Syntax errors) */
  /* p - Prelude */
  ESX_p101: () => `If there is an explicit end of the Prelude, there must also be an explicit beginning.`,
  ESX_p102: () => `Expected an explicit end of the Prelude (because the beginning is explicitly specified).`,
  ESX_p103: () => `Expected 'META'-property key.`,
  ESX_p104: () => `Expected 'META'-property value.`,
  ESX_p105: () => `Expected '${Prelude.STRTABLE_ELEMENT_END}' at end of string.`,
  /** @param {string} Line */
  ESX_p106: (Line) => `Failed to process this line from string table block.
	Line: '${Line}'`,
  ESX_p107: () => `Expected '${Prelude.STRTABLE_END}' at end of string table block.`,
  /* --- */
  ESX_1001: () => `Expected end of the block.`,
  /* ERT - Error RunTime (Runtime errors) */
  /** @param {string} Word */
  ERT_1001: (Word) => `Undefined word: '${Word}'`,
  /** @param {number} Needed   @param {number} Got */
  ERT_1002: (Needed, Got) => `Not enough values on stack.
	Expected: '${Needed}'
	Got: '${Got}'`,
  /** @param {string} Word   @param {string} JSType */
  ERT_1003: (Word, JSType) => `Definition of a post-block instruction must be a native function.
	Instruction: '${Word}'
	Definition JavaScript-type: '${JSType}'`,
  /** @param {number} StrIndex */
  ERT_1004: (StrIndex) => `String with index '${StrIndex}' not found.`,
  /*====== EXCEPTIONS ======*/
  /* XRT - eXception RunTime (Runtime exceptions) */
  /* i - Internal */
  /** @param {string} JSType */
  XRT_i101: (JSType) => `[internal] Unsupported JavaScript-runtime definition type: '${JSType}'`,
  /** @param {string} Proto */
  XRT_i102: (Proto) => `[internal] Unsupported JavaScript-runtime definition object type.
	Prototype: '${Proto}'`,
  XRT_i103: () => `[internal] Uncaught: 'LLL_STATE#StateStorage.PostBlock' is null`,
  /* XM - eXception Mixed (Multi-class/Unknown-class exceptions) */
  XM_1001: () => `Expected escape character, got end of string`,
  /** @param {string} Char */
  XM_1002: (Char) => `Non-existent special character: '\\${Char}'`,
  /** @param {any} Value */
  XM_1003: (Value) => `The given value cannot be converted to Integer/Float.
	Value: '${Value}'`,
  /*====== WARNINGS ======*/
  /** @param {LLL_STATE} S */
  W_1001: (S) => `When the program exits, the stack must be empty.
	Stack:
` + GetStateTrace.Stack(S)
};

// Source/oo24LLL/aAux.js
function ThrowRuntimeException(S, ECode, ...Args) {
  const Fn = Errors[ECode];
  _ThrowException(S, "LLL RuntimeException", ECode, Fn(...Args));
}
function ThrowRuntimeError(S, ECode, ...Args) {
  const Fn = Errors[ECode];
  _ThrowException(S, "LLL RuntimeError", ECode, Fn(...Args));
}
function ThrowSyntaxError(S, ECode, ...Args) {
  const Fn = Errors[ECode];
  _ThrowException(S, "LLL SyntaxError", ECode, Fn(...Args));
}
function EmitWarning(S, ECode, ...Args) {
  const Fn = Errors[ECode];
  const Msg = Fn(...Args);
  S.StdERR(`LLL Warning: ${Msg}` + _GetErrAppendix(S) + `	
ErrCode: [${ECode}]
`);
}
function _ThrowException(S, EClass, ECode, Msg) {
  S.StdERR(`${EClass}: ${Msg}` + _GetErrAppendix(S) + `	
ErrCode: [${ECode}]
`);
  S.StdERR(GetStateTrace(S));
  S.StdERR("\n\n");
  S._ExceptionHandler(EClass);
}
function _GetErrAppendix(S) {
  return `
	Script path: '${S.ScriptFullPath}'
	Line: ${S.TheReader.LineIndex}
	Column: ${S.TheReader.Column}` + (S.AdditionalLocationInfo ? "\n	Addit.Location: " + S.AdditionalLocationInfo : "") + `
`;
}
function Assert(S, Condition, EClass, ECode, ...Args) {
  if (Condition) return;
  const Fn = Errors[ECode];
  _ThrowException(S, EClass, ECode, Fn(...Args));
}
function AssertStackLength(S, Needed) {
  if (S.Stack.length < Needed)
    ThrowRuntimeException(S, "ERT_1002", Needed, S.Stack.length);
}
function HandleCharacterEscaping(S, AllCode) {
  let NewCode = "";
  let PreviousIndex = 0;
  theLoop: while (true) {
    const MatchIndex = AllCode.indexOf("\\", PreviousIndex + 2);
    if (MatchIndex == -1) break;
    if (MatchIndex + 1 == AllCode.length)
      ThrowRuntimeException(S, "XM_1001");
    NewCode += AllCode.slice(PreviousIndex, MatchIndex);
    PreviousIndex = MatchIndex;
    switch (AllCode[MatchIndex + 1]) {
      case "r":
        NewCode += "\r";
        continue theLoop;
      case "n":
        NewCode += "\n";
        continue theLoop;
      case "t":
        NewCode += "	";
        continue theLoop;
      case "0":
        NewCode += "\0";
        continue theLoop;
      case "\\":
        NewCode += "\\";
        continue theLoop;
      case "\n":
        continue theLoop;
      case "\r":
        if (AllCode[MatchIndex + 2] == "\n")
          AllCode = AllCode.slice(MatchIndex + 3);
        continue theLoop;
      default:
        ThrowRuntimeException(S, "XM_1002", AllCode[MatchIndex + 1]);
    }
  }
  NewCode += AllCode.slice(PreviousIndex, AllCode.length);
  return NewCode;
}
function MergeDictionaries_(...Dicts) {
  const ResultingEntries = [];
  for (const Dict of Dicts) {
    const Entries = Array.from(Dict.entries());
    ResultingEntries.push(...Entries);
  }
  return new Map(ResultingEntries);
}
function Unquote_(Target) {
  if (Target.length <= 2) return "";
  return Target.slice(1, Target.length - 1);
}

// Source/oo24LLL/AuxTyping.js
function MaybeAs_Number(S, Value) {
  if (typeof Value == "number")
    return Value;
  const AsNumber = Number(Value);
  if (isNaN(AsNumber))
    return null;
  return AsNumber;
}
function As_Number(S, Rtvalue) {
  const AsNumber = MaybeAs_Number(S, Rtvalue);
  if (AsNumber === null)
    ThrowRuntimeException(S, "XM_1003", Rtvalue);
  return AsNumber;
}
function As_String(S, Rtvalue) {
  return String(Rtvalue);
}
function Pop_Number(S) {
  return As_Number(S, S.Stack.pop());
}
function Pop_String(S) {
  return As_String(S, S.Stack.pop());
}

// Source/oo24LLL/DictStd.js
var DictStd_default = new Map(Object.entries({
  ////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Дублировать верхушку стека.
   * @signature `[value] dup`
   * @since `v0.0.1`
   */
  dup: (S) => {
    AssertStackLength(S, 1);
    S.Stack.push(S.Stack.peek());
  },
  /**
   * Дублирует СУБ-верхушку стека.
   * @signature `[value] [(top)] dupsub`
   * @since `v0.0.2`
   */
  dupsub: (S) => {
    AssertStackLength(S, 2);
    const Top = S.Stack.pop();
    const Subtop = S.Stack.peek();
    S.Stack.push(Top);
    S.Stack.push(Subtop);
  },
  /**
   * Снять значение с верхушки стека.
   * @signature `[value] drop`
   * @since `v0.0.2`
   */
  drop: (S) => {
    AssertStackLength(S, 1);
    S.Stack.pop();
  },
  ////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Получает из таблицы строк строку с указанным индексом (`strindex`)
   * и возвращает её.
   * @signature `[strindex] string`
   * @since `v0.0.1`
   */
  string: (S) => {
    AssertStackLength(S, 1);
    const StrIndex = Pop_Number(S);
    Assert(
      S,
      StrIndex >= 0 && StrIndex <= S.StringsTable.length,
      "LLL RuntimeError",
      "ERT_1004",
      StrIndex
    );
    const StringFromTable = S.StringsTable[StrIndex];
    Assert(
      S,
      StringFromTable !== void 0,
      "LLL RuntimeError",
      "ERT_1004",
      StrIndex
    );
    S.Stack.push(StringFromTable);
  },
  /**
   * Конкатенирует пред-вершину стека с вершиной.
   * @signature `[dest] [source] concat`
   * @since `v0.0.1`
   */
  concat: (S) => {
    AssertStackLength(S, 2);
    const Source = Pop_String(S);
    const Dest = Pop_String(S);
    S.Stack.push(Source.concat(Dest));
  },
  /**
   * Выводит вершину стека в консоль, ИЗВЛЕКАЯ её.
   * @signature `[value] print`
   * @since `v0.0.1`
   */
  print: (S) => {
    AssertStackLength(S, 1);
    S.StdOUT(Pop_String(S));
  },
  ////////////////////////////////////////////////////////////////////////////////////////
  /*
   * Базовые БИНАРНЫЕ математические операции.
   * Все имеют сигнатуру `[from] [to] OPERATION`
   * @since `v0.0.1`
   */
  sum: (S) => {
    AssertStackLength(S, 2);
    const From = Pop_Number(S);
    const To = Pop_Number(S);
    S.Stack.push(From + To);
  },
  sub: (S) => {
    AssertStackLength(S, 2);
    const From = Pop_Number(S);
    const To = Pop_Number(S);
    S.Stack.push(From - To);
  },
  mul: (S) => {
    AssertStackLength(S, 2);
    const From = Pop_Number(S);
    const To = Pop_Number(S);
    S.Stack.push(From * To);
  },
  div: (S) => {
    AssertStackLength(S, 2);
    const From = Pop_Number(S);
    const To = Pop_Number(S);
    S.Stack.push(Math.floor(From / To));
  },
  mod: (S) => {
    AssertStackLength(S, 2);
    const From = Pop_Number(S);
    const To = Pop_Number(S);
    S.Stack.push(From % To);
  }
}));

// Source/oo24LLL/DictSyntax.js
var DictSyntax_default = new Map(Object.entries({
  [Instr.DEFINE_VAR]: (S) => {
    AssertStackLength(S, 2);
    const VarName = Pop_String(S);
    const Value = S.Stack.pop();
    S.UserDict.set(VarName, Value);
  },
  [Constrct.DEFINE_FUNC]: (S) => {
    AssertStackLength(S, 1);
    const VarName = Pop_String(S);
    const Fragment = S.StateStorage.PostBlock;
    Assert(
      S,
      Fragment != null,
      "LLL RuntimeException",
      "XRT_i103"
    );
    Fragment.Label = VarName;
    S.UserDict.set(VarName, Fragment);
  },
  [Instr.DELETE_DEFINITION]: (S) => {
    AssertStackLength(S, 1);
    const VarName = Pop_String(S);
    S.UserDict.delete(VarName);
  },
  [Constrct.LOOP]: (S) => {
  }
}));

// Source/oo24LLL/TheMachine.js
var LLL_STATE = class {
  /**
   * @type {Record<string, LLL_Value>}
   * @readonly
   */
  ScriptMetadata = {};
  /**
   * @type {string[]}
   * @readonly
   */
  StringsTable = [
    ""
    //Строка с индексом (0) - пустая строка.
  ];
  /**
   * @type {libUtilsTy.IStack<LLL_Value>}
   * @readonly
   */
  Stack = IStack.create();
  /**
   * Имитация текущей области видимости.
   * @type {string[]} это 'IStack' так-то, однако нам нужны методы массивов.
   * @readonly
   */
  PseudoScope = [];
  /**
   * Словарь **пользовательских** определений.
   * Напоминаю, что никаких областей видимости на самом деле не существует, и структура словаря плоская.
   * 
   * @type {Dictionary}
   * @readonly
   */
  UserDict = /* @__PURE__ */ new Map();
  /**
   * Словарь **изначальных** определений.
   * 
   * Отличается тем, что определения здесь **константны**, а также не могут иметь области видимости -
   *  т.е. все данные слова всегда интерпретируются однозначно.
   * 
   * @type {ConstDict}
   * @readonly
   */
  PrimordialDict = MergeDictionaries_(DictSyntax_default, DictStd_default);
  /**
   * Хранилище дополнительных состояний интерпретатора.
   * @readonly
   */
  StateStorage = {
    /** Свободный номер для анонимных областей видимости. */
    _CurrentSymbolIndex: 1,
    /**
     * (Используется для синтаксических конструкций)
     * Блок кода определения, идущий после данной инструкции.
     * @type {CodeFragment | null}
     */
    PostBlock: null
  };
  ScriptFullPath = "no-file";
  /**
   * Дополнительная информация о том, где сейчас находится интерпретатор.
   * @type {string | null}
   */
  AdditionalLocationInfo = null;
  /**
   * Функция для получения ввода из текущего потока ввода (`stdin`)
   */
  StdIN = () => void 0;
  //W.I.P.
  /**
   * Функция для записи в текущий поток вывода (`stdout`)
   */
  StdOUT = (Message) => console.log(Message);
  /**
   * Функция для записи в текущий поток вывода ошибок (`stderr`)
   */
  StdERR = (Message) => console.error(Message);
  /**
   * Читатель, связанный с данным состоянием LLL.
   * @type {TheReader}
   */
  TheReader = __Any;
  /**
   * Обработчик ошибок (исключений) **на уровне платформы.**
   * @type {(ExcClass: KnownExceptionClass) => never}
   */
  _ExceptionHandler = (ExcClass) => {
    throw ExcClass;
  };
};
var _HandleTokenResult = {
  CONTINUE: 0,
  //в этом звене цепочки ничего не нашли; продолжаем цепочку проверок
  JUST_TOKEN: 1,
  //просто добавляем в буфер; прерываем цепочку проверок
  SKIP_TOKEN: 1 << 1,
  //пропускаем токен
  DRAIN_BUF: 1 << 2
  //в буфер НЕ добавляем: возвращаем значение буфера из 'GrabUnit'
};
var TheReader = class {
  Pos = 0;
  EndsAt;
  LineIndex = 1;
  Column = 1;
  PreviousUnit = "";
  //для instant-lookbehind инструкций (FUTURE)
  #PreviousUnitCandidate = "";
  PreviousPos = 0;
  #PreviousPosCandidate = 0;
  PreviousLineIndex = 1;
  #PreviousLineIndexCandidate = 1;
  PreviousColumn = 1;
  #PreviousColumnCandidate = 1;
  #Buf = "";
  #AllCode;
  get __AllCode() {
    return this.#AllCode;
  }
  /** Внутреннее состояние интерпретатора. */
  #InternalState = {
    /** Режим интерпретации СТРОЧНОГО комментария? */
    CommentLine: false,
    /** Режим интерпретации ВСТРОЕННОГО комментария? */
    InlineComment: false,
    /** Режим интерпретации НОМИНАЛЬНОЙ строки? ``(` обратная кавычка)`` */
    NominalString: false,
    /** Режим интерпретации ВИРТУАЛЬНОЙ строки? `(" двойная кавычка)` */
    VirtualString: false
  };
  /** Мы достигли конца кода? */
  IsCodeEnd = false;
  /** Мы достигли конца ФРАГМЕНТА кода? (текущего интерпретируемого определения) */
  IsFragmentEnd = false;
  /** Дополнительные опции чтения/интерпретации. Регулируются извне. @readonly */
  Options = {
    /** Обрабатывать встраиваемые комментарии? */
    HandleInlineComments: true,
    /** Обрабатывать строчные комментарии? */
    HandleCommentLines: true,
    /**
     * То, что считается "границей" текущей единицы кода: конец слова, конец строки, ...
     * 
     * Должен быть ОДИН символ. Иначе ба-бах.
     */
    UnitBound: " ",
    /** Возвращать ли буфер (из {@link GrabUnit()}) при переходе на новую строку? */
    DrainOnNewline: true,
    /** Пропускать пустые единицы кода? */
    SkipEmptyUnits: true
  };
  /**
   * @param {string} AllCode 
   */
  constructor(AllCode) {
    this.#AllCode = AllCode;
    this.EndsAt = AllCode.length - 1;
  }
  /**
   * *Извлекает из потока кода* текущую единицу кода (слово, строку и т.д.)
   * 
   * Если внезапно Читатель достиг конца кода - данная функция вернёт некорректное значение.
   * Проверка конца кода ({@link IsCodeEnd}) перед дальнейшей обработкой единицы кода -
   *  на вашей совести!
   * @returns {string}
   */
  GrabUnit() {
    this.IsFragmentEnd = false;
    this.PreviousUnit = this.#PreviousUnitCandidate;
    this.PreviousPos = this.#PreviousPosCandidate;
    this.PreviousColumn = this.#PreviousColumnCandidate;
    this.PreviousLineIndex = this.#PreviousLineIndexCandidate;
    if (this.Pos - 1 == this.EndsAt) {
      this.IsCodeEnd = true;
      return __Any;
    }
    while (true) {
      const Tk = this.#AllCode[this.Pos];
      this.Pos++;
      let CurrentStatus = this.#MaybeHandle_Newline(Tk) || this.#MaybeHandle_String(Tk) || this.#MaybeHandle_CommentLine(Tk) || this.#MaybeHandle_InlineComment(Tk) || this.#MaybeHandle_InterpretingUnitBound(Tk);
      if (CurrentStatus == _HandleTokenResult.CONTINUE || CurrentStatus & _HandleTokenResult.JUST_TOKEN) this.#Buf += Tk;
      if (this.Pos - 1 == this.EndsAt) {
        if (this.#Buf.length > 0)
          return this.#DrainBuffer();
        this.IsCodeEnd = true;
        return __Any;
      }
      if (CurrentStatus & _HandleTokenResult.SKIP_TOKEN) continue;
      else if (CurrentStatus & _HandleTokenResult.DRAIN_BUF) return this.#DrainBuffer();
    }
  }
  /**
   * Возвращается курсор Читателя к предыдущей единице кода.
   * 
   * Размер истории - `1`. Это значит, что можно прыгнуть только 1 раз подряд
   *  (т.е. более поздняя история не сохранилась)
   */
  JumpBack() {
    this.Pos = this.PreviousPos;
    this.Column = this.PreviousColumn;
    this.LineIndex = this.PreviousLineIndex;
  }
  /**
   * @returns {string}
   */
  #DrainBuffer() {
    const Word = this.#Buf;
    this.#Buf = "";
    this.#PreviousUnitCandidate = Word;
    this.#PreviousPosCandidate = this.Pos;
    return Word;
  }
  /* Обратите внимание: методы '#MaybeHandle_*' не должны мутировать
  |  "глобальное" состояние Читателя (поля '#Bounds', 'Pos', '#AllCode').
  Исключение - внутреннее состояние ('#InternalState') и '#LineIndex' (в методе '#MaybeHandle_Newline').
  Кроме этого, данные функции не должны читать код самостоятельно (могут получать лишь
  |  один прочитанный символ, + иметь доступ к буферу '#Buf')
  |  или мутировать "глобальное" состояние Читателя. */
  /**
   * Часть {@link GrabUnit()}, отвечающая за обработку переходов на новую строку.
   * @param {string} Tk 
   * @returns {number}
   */
  #MaybeHandle_Newline(Tk) {
    if (Tk == "\n") {
      this.LineIndex++;
      this.Column = 0;
      if (this.#Buf.length > 0 && this.Options.DrainOnNewline)
        return _HandleTokenResult.DRAIN_BUF;
      return _HandleTokenResult.SKIP_TOKEN;
    }
    if (Tk == "\r")
      return _HandleTokenResult.SKIP_TOKEN;
    return _HandleTokenResult.CONTINUE;
  }
  /**
   * Часть {@link GrabUnit()}, отвечающая за обработку строк.
   * @param {string} Tk 
   * @returns {number}
   */
  #MaybeHandle_String(Tk) {
    if (Tk == TK_NOMINAL_STRING) {
      if (this.#InternalState.NominalString) {
        this.#InternalState.NominalString = false;
        return _HandleTokenResult.JUST_TOKEN | _HandleTokenResult.DRAIN_BUF;
      } else {
        this.#InternalState.NominalString = true;
        return _HandleTokenResult.JUST_TOKEN;
      }
    } else if (Tk == TK_VIRTUAL_STRING) {
      if (this.#InternalState.VirtualString) {
        this.#InternalState.VirtualString = false;
        return _HandleTokenResult.JUST_TOKEN | _HandleTokenResult.DRAIN_BUF;
      } else {
        this.#InternalState.VirtualString = true;
        return _HandleTokenResult.JUST_TOKEN;
      }
    }
    if (this.#InternalState.NominalString || this.#InternalState.VirtualString)
      return _HandleTokenResult.JUST_TOKEN;
    else
      return _HandleTokenResult.CONTINUE;
  }
  /**
   * Часть {@link GrabUnit()}, отвечающая за обработку строчных комментариев.
   * @param {string} Tk 
   * @returns {number}
   */
  #MaybeHandle_CommentLine(Tk) {
    if (!this.Options.HandleCommentLines)
      return _HandleTokenResult.CONTINUE;
    if (!this.#InternalState.InlineComment && Tk == TK_COMMENT_LINE_START_A || Tk == TK_COMMENT_LINE_START_B) {
      this.#InternalState.CommentLine = true;
      return _HandleTokenResult.SKIP_TOKEN;
    }
    if (Tk == "\n") {
      this.#InternalState.CommentLine = false;
      if (this.#Buf.length > 0 && this.Options.DrainOnNewline)
        return _HandleTokenResult.DRAIN_BUF;
      return _HandleTokenResult.SKIP_TOKEN;
    }
    if (this.#InternalState.CommentLine)
      return _HandleTokenResult.SKIP_TOKEN;
    return _HandleTokenResult.CONTINUE;
  }
  /**
   * Часть {@link GrabUnit()}, отвечающая за обработку встраиваемых комментариев.
   * @param {string} Tk 
   * @returns {number}
   */
  #MaybeHandle_InlineComment(Tk) {
    if (!this.Options.HandleInlineComments)
      return _HandleTokenResult.CONTINUE;
    if (Tk == TK_INLINE_COMMENT_START) {
      this.#InternalState.InlineComment = true;
      return _HandleTokenResult.SKIP_TOKEN;
    }
    if (this.#InternalState.InlineComment && Tk == TK_INLINE_COMMENT_END) {
      this.#InternalState.InlineComment = false;
      return _HandleTokenResult.SKIP_TOKEN;
    }
    if (this.#InternalState.InlineComment)
      return _HandleTokenResult.SKIP_TOKEN;
    return _HandleTokenResult.CONTINUE;
  }
  /**
   * Граница интересующей нас единицы кода: пробела, перехода на новую строку и т.д.
   * @param {string} Tk 
   * @returns {number}
   */
  #MaybeHandle_InterpretingUnitBound(Tk) {
    if (Tk == this.Options.UnitBound) {
      if (this.#Buf.length > 0 || !this.Options.SkipEmptyUnits)
        return _HandleTokenResult.DRAIN_BUF;
      return _HandleTokenResult.SKIP_TOKEN;
    }
    return _HandleTokenResult.CONTINUE;
  }
};
var CodeFragment = class {
  /** @type {(string | CodeFragment)[]} */
  Words;
  /** @type {string} */
  Label;
  /**
   * (НЕ РЕКУРСИВНО) Превращает текущее определение в самый обычный массив слов,
   *  сохраняя (псевдо-) области видимости.
   * @mutates
   */
  MakeFlat() {
    for (let i = 0; i < this.Words.length; i++) {
      const W = this.Words[i];
      if (typeof W == "object")
        this.Words.splice(i, 1, ...[
          this.Label,
          Instr.EnterScope,
          ...W.Words,
          Instr.ExitScope
        ]);
    }
  }
  /**
   * @param {(string | CodeFragment)[]} Words 
   * @param {string} Label 
   */
  constructor(Words, Label) {
    this.Words = Words;
    this.Label = Label;
  }
};

// Source/oo24LLL/Interpreter.js
function LLL_EXECUTE(AllCode, S = new LLL_STATE()) {
  if (AllCode.length == 0) return;
  const Reader = new TheReader(AllCode);
  S.TheReader = Reader;
  InterpretPrelude(S);
  if (S.TheReader.IsCodeEnd) return;
  InterpretMainCode(S);
  if (S.Stack.length > 0) {
    EmitWarning(S, "W_1001", S);
  }
}
function InterpretPrelude(S) {
  S.AdditionalLocationInfo = "<prelude>";
  let ExplicitPreludeScope = false;
  interpreting: while (true) {
    const Instruction = S.TheReader.GrabUnit();
    if (S.TheReader.IsCodeEnd) return;
    switch (Instruction) {
      case Prelude.META: {
        let PropertyKey = S.TheReader.GrabUnit();
        if (S.TheReader.IsCodeEnd)
          ThrowSyntaxError(S, "ESX_p103");
        S.TheReader.Options.HandleInlineComments = false;
        S.TheReader.Options.HandleCommentLines = false;
        S.TheReader.Options.UnitBound = "\n";
        let PropertyValue = S.TheReader.GrabUnit();
        if (S.TheReader.IsCodeEnd)
          ThrowSyntaxError(S, "ESX_p104");
        S.TheReader.Options.HandleInlineComments = true;
        S.TheReader.Options.HandleCommentLines = true;
        S.TheReader.Options.UnitBound = " ";
        S.ScriptMetadata[PropertyKey] = PropertyValue;
        break;
      }
      case Prelude.STRTABLE_START: {
        InterpretStringsTable(S);
        break;
      }
      case Prelude.EXPLICIT_START_PRELUDE:
        ExplicitPreludeScope = true;
        break;
      case Prelude.EXPLICIT_END_PRELUDE:
        if (!ExplicitPreludeScope)
          ThrowSyntaxError(S, "ESX_p101");
        break interpreting;
      default:
        if (ExplicitPreludeScope)
          ThrowSyntaxError(S, "ESX_p102");
        S.TheReader.JumpBack();
        break interpreting;
    }
  }
}
function InterpretStringsTable(S) {
  S.AdditionalLocationInfo = "<prelude/StringsTable>";
  S.TheReader.Options.UnitBound = "\n";
  S.TheReader.Options.SkipEmptyUnits = false;
  interpreting: while (true) {
    let Line = S.TheReader.GrabUnit();
    if (S.TheReader.IsCodeEnd) break interpreting;
    let Content = "";
    if (Line == Prelude.STRTABLE_ELEMENT_START) {
      S.TheReader.Options.HandleInlineComments = false;
      S.TheReader.Options.HandleCommentLines = false;
      readingString: while (true) {
        const Line2 = S.TheReader.GrabUnit();
        if (S.TheReader.IsCodeEnd) break readingString;
        if (Line2 == Prelude.STRTABLE_ELEMENT_END) {
          Content = HandleCharacterEscaping(S, Content);
          S.StringsTable.push(Content);
          continue interpreting;
        }
        if (Line2 == "\\" + Prelude.STRTABLE_ELEMENT_END) {
          if (Content.length > 0)
            Content += "\n";
          Content += Prelude.STRTABLE_ELEMENT_END;
          continue readingString;
        }
        if (Content.length > 0)
          Content += "\n";
        Content += Line2;
      }
      ThrowRuntimeException(S, "ESX_p105");
    } else if (Line == Prelude.STRTABLE_END) {
      S.TheReader.Options.HandleCommentLines = true;
      S.TheReader.Options.HandleInlineComments = true;
      S.TheReader.Options.DrainOnNewline = true;
      S.TheReader.Options.UnitBound = " ";
      S.TheReader.Options.SkipEmptyUnits = true;
      return;
    } else
      ThrowRuntimeException(S, "ESX_p106", Line);
  }
  ThrowRuntimeException(S, "ESX_p107");
}
function InterpretWord(S, Word) {
  if (Word.length > 1 && Word.startsWith('"') && Word.endsWith('"')) {
    const Handled = Unquote_(Word);
    S.Stack.push(Handled);
    return;
  }
  const MaybeAsNumber = MaybeAs_Number(S, Word);
  if (MaybeAsNumber !== null) {
    S.Stack.push(MaybeAsNumber);
    return;
  }
  const Definition = _SearchForDefinition(S, Word);
  if (Word.endsWith("...")) {
    const CodeFragment2 = ParseCodeblock(S, null);
    S.StateStorage.PostBlock = CodeFragment2;
    if (typeof Definition == "function")
      Definition(S);
    else
      ThrowRuntimeException(S, "ERT_1003", Word, typeof Definition);
    S.StateStorage.PostBlock = null;
    return;
  }
  switch (typeof Definition) {
    case "undefined":
      ThrowRuntimeException(S, "ERT_1001", Word);
    case "number":
    //это числовое значение => уверенно кидаем в стек
    case "string":
      S.Stack.push(Definition);
      return;
    case "function":
      Definition(S);
      return;
    case "object": {
      if (Definition instanceof CodeFragment) {
        RecursivelyInterpretCodeblock(S, Definition);
        return;
      }
      ThrowRuntimeException(S, "XRT_i102", Object.getPrototypeOf(Definition));
    }
    default:
      ThrowRuntimeException(S, "XRT_i101", typeof Definition);
  }
}
function InterpretMainCode(S) {
  S.AdditionalLocationInfo = null;
  while (true) {
    const Word = S.TheReader.GrabUnit();
    if (S.TheReader.IsCodeEnd) break;
    InterpretWord(S, Word);
  }
}
var _AllComplexConstructions = Object.values(Constrct);
function ParseCodeblock(S, Label) {
  S.AdditionalLocationInfo = Label;
  Label = _MakeLabel(S, Label);
  S.PseudoScope.push(Label);
  const Definition = new CodeFragment([], Label);
  let Depth = 0;
  while (true) {
    const Word = S.TheReader.GrabUnit();
    if (Word == INSTR_END_OF_BLOCK) {
      if (Depth == 0) break;
      Depth--;
    }
    if (S.TheReader.IsCodeEnd)
      ThrowRuntimeException(S, "ESX_1001");
    if (_AllComplexConstructions.includes(Word)) {
      Depth++;
      let MaybeInnerLabel = __Any;
      if (Word == Constrct.DEFINE_FUNC)
        MaybeInnerLabel = Definition.Words.pop();
      const InnerDefinition = ParseCodeblock(S, _MakeLabel(S, MaybeInnerLabel));
      Definition.Words.push(...InnerDefinition.Words);
    } else
      Definition.Words.push(Word);
  }
  S.AdditionalLocationInfo = null;
  S.PseudoScope.pop();
  return Definition;
}
function RecursivelyInterpretCodeblock(S, Block) {
  S.PseudoScope.push(Block.Label);
  for (const W of Block.Words)
    if (typeof W == "string")
      InterpretWord(S, W);
    else
      RecursivelyInterpretCodeblock(S, W);
  S.PseudoScope.pop();
}
function _MakeLabel(S, MaybeLabel) {
  return MaybeLabel ?? MakeIntrinsic("AnonymScope:" + S.StateStorage._CurrentSymbolIndex++);
}
function _SearchForDefinition(S, Word) {
  const MaybePrimordialDefinition = S.PrimordialDict.get(Word);
  if (MaybePrimordialDefinition) return MaybePrimordialDefinition;
  const CurrentScope = [...S.PseudoScope];
  while (CurrentScope.length > 0) {
    const FullScope = CurrentScope.join(TK_SCOPE_SEPARATOR);
    const FullWord = FullScope + TK_SCOPE_SEPARATOR + Word;
    const MaybeDefinition = S.UserDict.get(FullWord);
    if (MaybeDefinition !== void 0) return MaybeDefinition;
    CurrentScope.pop();
  }
  return S.UserDict.get(Word);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  As_Number,
  As_String,
  Assert,
  AssertStackLength,
  ClampNumber,
  ClampToLength,
  CodeFragment,
  CompleteToLength,
  Constrct,
  EmitWarning,
  FitStringsInLength,
  GetStateTrace,
  HandleCharacterEscaping,
  INSTR_END_OF_BLOCK,
  IStack,
  Instr,
  IsInteger,
  LLL_EXECUTE,
  LLL_STATE,
  Labelled,
  MakeIntrinsic,
  MaybeAs_Number,
  MergeDictionaries_,
  OmitKeysFrom,
  Pop_Number,
  Pop_String,
  Prelude,
  RemoveSuffix,
  TK_COMMENT_LINE_START_A,
  TK_COMMENT_LINE_START_B,
  TK_INLINE_COMMENT_END,
  TK_INLINE_COMMENT_START,
  TK_NOMINAL_STRING,
  TK_SCOPE_SEPARATOR,
  TK_VIRTUAL_STRING,
  TheReader,
  ThrowRuntimeError,
  ThrowRuntimeException,
  ThrowSyntaxError,
  Unquote_,
  __Any
});
