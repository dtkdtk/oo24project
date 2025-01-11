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
  Assert: () => Assert,
  AssertStackLength: () => AssertStackLength,
  Assert_At: () => Assert_At,
  Assert_Here: () => Assert_Here,
  ClampNumber: () => ClampNumber,
  ClampToLength: () => ClampToLength,
  CompleteToLength_Prefix: () => CompleteToLength_Prefix,
  FitStringsInLength: () => FitStringsInLength,
  GetStateTrace: () => GetStateTrace,
  IStack: () => IStack,
  IsInteger: () => IsInteger,
  LLL_EXECUTE: () => LLL_EXECUTE,
  LLL_STATE: () => LLL_STATE,
  OmitKeysFrom: () => OmitKeysFrom,
  Pop_Float: () => Pop_Float,
  Pop_Integer: () => Pop_Integer,
  Pop_String: () => Pop_String,
  RemoveSuffix: () => RemoveSuffix,
  ReprAs_Float: () => ReprAs_Float,
  ReprAs_Integer: () => ReprAs_Integer,
  ReprAs_String: () => ReprAs_String,
  RtvalueOf: () => RtvalueOf,
  RtvalueOf_Number: () => RtvalueOf_Number,
  RtvalueOf_String: () => RtvalueOf_String,
  ThrowRuntimeExc: () => ThrowRuntimeExc,
  ThrowRuntimeExc_At: () => ThrowRuntimeExc_At,
  ThrowRuntimeExc_Here: () => ThrowRuntimeExc_Here,
  _PrepareCodeLine: () => _PrepareCodeLine,
  _WordStream: () => _WordStream
});
module.exports = __toCommonJS(include_exports);

// Source/Utils-typed.js
var IStack = class extends Array {
  peek() {
    return this[this.length - 1];
  }
};

// Source/Utils.js
function OmitKeysFrom(Source, ...Keys) {
  const Buf = {};
  for (const K in Source)
    if (!Keys.includes(K))
      Buf[K] = Source[K];
  return Buf;
}
function CompleteToLength_Prefix(TargetLength, Str) {
  let Prefix = "";
  const Needed = TargetLength - Str.length;
  if (Needed < 0) {
    console.warn(`INTERNAL BUG: 'Source/Utils: CompleteToLength_Prefix()': Given Str length greater than TargetLength.`);
    return Str;
  }
  if (Needed > 0)
    Prefix += " ".repeat(Needed);
  return Prefix + Str;
}
function ClampToLength(TargetLength, Str) {
  let Buf = Str;
  if (Str.length < TargetLength)
    Buf += " ".repeat(TargetLength - Str.length);
  else if (Str.length > TargetLength)
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

// Source/oo24LLL/aAux.js
var aAux_exports = {};
__export(aAux_exports, {
  Assert: () => Assert,
  AssertStackLength: () => AssertStackLength,
  Assert_At: () => Assert_At,
  Assert_Here: () => Assert_Here,
  GetStateTrace: () => GetStateTrace,
  Pop_Float: () => Pop_Float,
  Pop_Integer: () => Pop_Integer,
  Pop_String: () => Pop_String,
  ReprAs_Float: () => ReprAs_Float,
  ReprAs_Integer: () => ReprAs_Integer,
  ReprAs_String: () => ReprAs_String,
  RtvalueOf: () => RtvalueOf,
  RtvalueOf_Number: () => RtvalueOf_Number,
  RtvalueOf_String: () => RtvalueOf_String,
  ThrowRuntimeExc: () => ThrowRuntimeExc,
  ThrowRuntimeExc_At: () => ThrowRuntimeExc_At,
  ThrowRuntimeExc_Here: () => ThrowRuntimeExc_Here
});

// Source/oo24LLL/AuxStateTrace.js
var TARGET_TERMINAL_WIDTH = 100;
function GetStateTrace(S) {
  let Buf = "Current interpreter's state:\n";
  ;
  _ScriptMetadataFormatting: {
    Buf += "> ScriptMetadata:\n";
    const Entries = Object.entries(S.ScriptMetadata);
    if (Entries.length == 0) {
      Buf += "	<empty>\n";
      break _ScriptMetadataFormatting;
    }
    const MaxIndex = Entries.length - 1;
    const IndexLength = MaxIndex.toString().length;
    const MaxKeyLength = [...Entries].sort(([keyA], [keyB]) => keyB.length - keyA.length)[0].length;
    for (let i = 0; i < Entries.length; i++) {
      const [Key, Value] = Entries[i];
      Buf += "	";
      Buf += CompleteToLength_Prefix(IndexLength, i.toString());
      Buf += "| ";
      Buf += CompleteToLength_Prefix(MaxKeyLength, Key);
      Buf += " | ";
      Buf += ClampToLength(TARGET_TERMINAL_WIDTH - MaxKeyLength, S.aux.ReprAs_String(Value));
      Buf += "\n";
    }
  }
  ;
  ;
  _StringsTableFormatting: {
    Buf += "> StringsTable:\n";
    if (S.StringsTable.length == 0) {
      Buf += "	<empty>\n";
      break _StringsTableFormatting;
    }
    const MaxIndex = S.StringsTable.length - 1;
    const IndexLength = MaxIndex.toString().length;
    for (let i = 0; i < S.StringsTable.length; i++) {
      Buf += "	";
      Buf += CompleteToLength_Prefix(IndexLength, i.toString());
      Buf += "| ";
      Buf += ClampToLength(TARGET_TERMINAL_WIDTH, S.StringsTable[i]);
      Buf += "\n";
    }
  }
  ;
  ;
  _StackFormatting: {
    Buf += "> Stack:\n";
    if (S.Stack.length == 0) {
      Buf += "	<empty>\n";
      break _StackFormatting;
    }
    const MaxIndex = S.Stack.length - 1;
    const IndexLength = ClampNumber.OnlyMin(3, MaxIndex.toString().length);
    Buf += "	TOP| ";
    Buf += ClampToLength(TARGET_TERMINAL_WIDTH, S.aux.ReprAs_String(S.Stack.peek()));
    Buf += "\n";
    for (let i = S.Stack.length - 2; i >= 0; i--) {
      Buf += "	";
      Buf += CompleteToLength_Prefix(IndexLength, i.toString());
      Buf += "| ";
      Buf += ClampToLength(TARGET_TERMINAL_WIDTH, S.aux.ReprAs_String(S.Stack.peek()));
      Buf += "\n";
    }
  }
  ;
  ;
  _ClosuresFormatting: {
    Buf += "> Closures:\n";
    if (S.Closures.length == 0) {
      Buf += "	<empty>\n";
      break _ClosuresFormatting;
    }
    const MaxIndex = S.Closures.length - 1;
    const IndexLength = ClampNumber.OnlyMin(3, MaxIndex.toString().length);
    ;
    {
      const IndexDisplay = "	" + CompleteToLength_Prefix(IndexLength, "TOP") + "| ";
      const Words = Array.from(S.Closures[S.Closures.length - 1].keys());
      const WordsMosaic = FitStringsInLength(Words, TARGET_TERMINAL_WIDTH, 1);
      Buf += IndexDisplay;
      Buf += WordsMosaic.map((it) => it.join(" ")).join("\n" + IndexDisplay);
      Buf += "\n";
    }
    ;
    for (let i = S.Closures.length - 2; i >= 0; i--) {
      const IndexDisplay = "	" + CompleteToLength_Prefix(IndexLength, (i - MaxIndex).toString()) + "| ";
      const Words = Array.from(S.Closures[i].keys());
      const WordsMosaic = FitStringsInLength(Words, TARGET_TERMINAL_WIDTH, 1);
      Buf += IndexDisplay;
      Buf += WordsMosaic.map((it) => it.join(" ")).join("\n" + IndexDisplay);
      Buf += "\n";
    }
  }
  ;
  return Buf;
}

// Source/oo24LLL/AuxReprConversions.js
function RtvalueOf(S, Repr) {
  if (typeof Repr == "number")
    return RtvalueOf_Number(S, Repr);
  else if (typeof Repr == "string")
    return RtvalueOf_String(S, Repr);
  else
    throw new TypeError(`Unknown representation.
	Supported: 'number', 'string'
	Got: '${typeof Repr}'`);
}
function RtvalueOf_Number(S, NumRepr) {
  if (IsInteger(NumRepr)) {
    const View = new BigInt64Array(1);
    View[0] = BigInt(NumRepr);
    return View.buffer;
  } else {
    const View = new Float64Array(1);
    View[0] = NumRepr;
    return View.buffer;
  }
}
function RtvalueOf_String(S, StrRepr) {
  const Encoder = new TextEncoder();
  return Encoder.encode(StrRepr).buffer;
}
function ReprAs_Integer(S, Rtvalue) {
  const View = new BigInt64Array(Rtvalue);
  if (View.length > 1)
    return ThrowRuntimeExc_Here(S, `Expected Integer number, received '0x${Buffer.from(Rtvalue).toString("hex")}'.`);
  const Num = Number(View[0]);
  if (isNaN(Num))
    return ThrowRuntimeExc_Here(S, `The given value cannot be converted to Integer.`);
  if (!IsInteger(Num))
    return ThrowRuntimeExc_Here(S, `Expected Integer number, received Float number.`);
  return Num;
}
function ReprAs_Float(S, Rtvalue) {
  const View = new Float64Array(Rtvalue);
  if (View.length > 1)
    return ThrowRuntimeExc_Here(S, `Expected Float number, received '0x${Buffer.from(Rtvalue).toString("hex")}'.`);
  const Num = Number(View[0]);
  if (isNaN(Num))
    return ThrowRuntimeExc_Here(S, `The given value cannot be converted to Float.`);
  return Num;
}
function ReprAs_String(S, Rtvalue) {
  const Decoder = new TextDecoder("utf8");
  return Decoder.decode(Rtvalue);
}

// Source/oo24LLL/aAux.js
function ThrowRuntimeExc(S, Msg) {
  console.error("LLL Runtime exception: " + Msg + "\n");
  console.error(GetStateTrace(S));
  throw "LLL RuntimeException";
}
function ThrowRuntimeExc_At(S, Where, Msg) {
  ThrowRuntimeExc(S, `'${Where}': ${Msg}`);
}
function ThrowRuntimeExc_Here(S, Msg) {
  ThrowRuntimeExc(S, `'${S.CurrentInterpretingWord}': ${Msg}`);
}
function Assert(S, Condition, ErrorMsg) {
  if (!Condition)
    ThrowRuntimeExc(S, ErrorMsg);
}
function Assert_At(S, Where, Condition, ErrorMsg) {
  if (!Condition)
    ThrowRuntimeExc_At(S, Where, ErrorMsg);
}
function Assert_Here(S, Condition, ErrorMsg) {
  Assert_At(S, S.CurrentInterpretingWord, Condition, ErrorMsg);
}
function AssertStackLength(S, Needed) {
  if (S.Stack.length < Needed)
    ThrowRuntimeExc_At(S, S.CurrentInterpretingWord, `Not enough values on stack.
	Expected '${Needed}', stack contains '${S.Stack.length}'.`);
}
function Pop_Integer(S) {
  return ReprAs_Integer(S, S.Stack.pop());
}
function Pop_Float(S) {
  return ReprAs_Float(S, S.Stack.pop());
}
function Pop_String(S) {
  return ReprAs_String(S, S.Stack.pop());
}

// Source/oo24LLL/Aux-bind.js
function AuxOf(S) {
  const Functions = {};
  const AllKeys = Object.keys(aAux_exports);
  for (const Key of AllKeys) {
    const Fn = aAux_exports[Key];
    Functions[Key] = Fn.bind({}, S);
  }
  return Functions;
}

// Source/oo24LLL/DictStd.js
var DictStd_default = new Map(Object.entries({
  ////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Дублировать верхушку стека.
   * @signature `[value] dup`
   */
  dup: (S, ws) => {
    S.aux.AssertStackLength(1);
    S.Stack.push(S.Stack.peek());
  },
  /**
   * Дублирует СУБ-верхушку стека.
   * @signature `[subtop] [] dupsub`
   */
  dupsub: (S, ws) => {
    S.aux.AssertStackLength(2);
    const Top = S.Stack.pop();
    const Subtop = S.Stack.peek();
    S.Stack.push(Top);
    S.Stack.push(Subtop);
  },
  /**
   * Снять значение с верхушки стека.
   * @signature `[value] drop`
   */
  drop: (S, ws) => {
    S.aux.AssertStackLength(1);
    S.Stack.pop();
  },
  ////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Получает из таблицы строк строку с указанным индексом (`strindex`)
   * и возвращает её.
   * @signature `[strindex] string`
   */
  string: (S, ws) => {
    S.aux.AssertStackLength(1);
    const StrIndex = S.aux.Pop_Integer();
    S.aux.Assert_Here(StrIndex >= 0 && StrIndex < S.StringsTable.length, `String with index '${StrIndex}' not found.`);
    const StringFromTable = S.StringsTable[StrIndex];
    S.aux.Assert_Here(StringFromTable !== void 0, `String not found.`);
    S.Stack.push(S.aux.RtvalueOf_String(StringFromTable));
  },
  /**
   * Конкатенирует пред-вершину стека с вершиной.
   * @signature `[dest] [source] concat`
   */
  concat: (S, ws) => {
    S.aux.AssertStackLength(2);
    const Source = S.aux.Pop_String();
    const Dest = S.aux.Pop_String();
    S.Stack.push(S.aux.RtvalueOf(Source.concat(Dest)));
  },
  /**
   * Выводит вершину стека в консоль, ИЗВЛЕКАЯ её.
   * @signature `[value] print`
   */
  print: (S, ws) => {
    S.aux.AssertStackLength(1);
    console.log(S.aux.Pop_String());
  },
  ////////////////////////////////////////////////////////////////////////////////////////
  /*
   * Базовые БИНАРНЫЕ математические операции.
   * Все имеют сигнатуру `[from] [to] OPERATION`
   */
  sum: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.Pop_Integer();
    const To = S.aux.Pop_Integer();
    S.Stack.push(S.aux.RtvalueOf(From + To));
  },
  sub: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.Pop_Integer();
    const To = S.aux.Pop_Integer();
    S.Stack.push(S.aux.RtvalueOf(From - To));
  },
  mul: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.Pop_Integer();
    const To = S.aux.Pop_Integer();
    S.Stack.push(S.aux.RtvalueOf(From * To));
  },
  div: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.Pop_Integer();
    const To = S.aux.Pop_Integer();
    S.Stack.push(S.aux.RtvalueOf(~~(From / To)));
  },
  mod: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.Pop_Integer();
    const To = S.aux.Pop_Integer();
    S.Stack.push(S.aux.RtvalueOf(From % To));
  }
}));

// Source/oo24LLL/DictSyntax.js
var DictSyntax_default = new Map(Object.entries({
  SYNTWORD: () => {
  }
}));

// Source/oo24LLL/TheMachine.js
var LLL_STATE = class {
  /**
   * См. {@link __Aux `./aAux.js`} - все функции там.
   * 
   * Внимание! Аргумент `S: LLL_STATE` в каждой из функций указывается автоматически.
   */
  aux = AuxOf(this);
  /**
   * @type {Record<string, llval_ty>}
   * @readonly
   */
  ScriptMetadata = {};
  /**
   * @type {{}}
   * @readonly
   */
  Pragmas = {};
  /**
   * @type {string[]}
   * @readonly
   */
  StringsTable = [];
  /**
   * @type {libUtilsTy.IStack<llval_ty>}
   * @readonly
   */
  Stack = new IStack();
  /**
   * Стек *замыканий*: областей видимости слов(функций) и переменных.
   * @type {libUtilsTy.IStack<Map<string, llval_ty | NativeJsFunction | _WordStream>>}
   * @readonly
   */
  Closures = new IStack(
    //Замыкания по умолчанию:
    DictSyntax_default,
    DictStd_default,
    /* @__PURE__ */ new Map()
  );
  /**
   * Интерпретируемое в данный момент слово.
   * @type {string}
   */
  CurrentInterpretingWord = "";
  //Ответственность закреплена за 'RecursiveInterpret'
};
var _WordStream = class {
  #LineIndex = 0;
  get LineIndex() {
    return this.#LineIndex;
  }
  /** @type {string[]} */
  #Lines = [];
  /** @type {string[]} */
  #CurrentLine = [];
  /**
   * @param {string} AllCode 
   */
  constructor(AllCode) {
    this.#Lines = AllCode.split(/\r?\n/);
  }
  /**
   * Берёт текущий символ (со сдвигом потока).
   * 
   * Проверка конца кода на вашей совести!
   * @returns {string}
   */
  tkGrab() {
    return this.#CurrentLine.shift();
  }
  /**
   * Проверяет наличие слов в `#CurrentLine`,
   * иначе - дополняет **с вырезанием комментариев и лишних пробелов**
   * @returns {boolean} НЕ достигнут ли конец кода?
   * @mutates
   */
  tkRefillLineBuff() {
    if (this.#EndOfCode()) return false;
    if (this.#CurrentLine.length == 0) {
      let RawLine = this.#Lines[this.#LineIndex];
      RawLine = _PrepareCodeLine(RawLine);
      this.#LineIndex++;
      if (RawLine.length == 0) return this.tkRefillLineBuff();
      this.#CurrentLine = RawLine.split(/\s/).filter((word) => word != "");
      return true;
    }
    return true;
  }
  /**
   * Больше кода нету?
   */
  #EndOfCode() {
    return this.#LineIndex == this.#Lines.length && this.#CurrentLine.length == 0;
  }
};
var TK_COMMENT_START = ";";
function _PrepareCodeLine(Line) {
  return Line.split(TK_COMMENT_START, 1)[0].replaceAll(/\(.*?\)/g, "").replaceAll(/( )+/g, " ").trim();
}

// Source/oo24LLL/Interpreter.js
function LLL_EXECUTE(AllCode, S = new LLL_STATE()) {
  AllCode = AllCode.replaceAll("\r\n", "\n");
  AllCode = InterpretPrelude(AllCode, S);
  if (AllCode.length == 0) return;
  const TheStream = new _WordStream(AllCode);
  RecursiveInterpret(S, TheStream);
}
function InterpretPrelude(AllCode, S) {
  while (AllCode.length > 0) {
    let [Line, ...OtherLines] = AllCode.split("\n");
    AllCode = OtherLines.join("\n");
    Line = _PrepareCodeLine(Line);
    if (Line.length == 0) continue;
    const ParsedLine = Line.split(" ");
    switch (ParsedLine[0]) {
      case "META": {
        S.aux.Assert_At("<prelude>", ParsedLine.length > 2, "Incorrect use of 'META' directive. Expected a field key and value.");
        let [Key, Value] = ParsedLine.slice(1);
        Key = RemoveSuffix(Key, ":");
        S.ScriptMetadata[Key] = ParseValue(S, Value);
        break;
      }
      case "STRINGS-TABLE:": {
        const NewCode = AllCode.split("\n").slice(1).join("\n");
        return InterpretStringsTable(NewCode, S);
      }
      default:
        return Line + "\n" + AllCode;
    }
  }
  throw new Error("Impossible error");
}
function InterpretStringsTable(AllCode, S) {
  while (AllCode.length > 0) {
    let [Line, ...OtherLines] = AllCode.split("\n\n");
    AllCode = OtherLines.join("\n\n");
    const [TheInstruction] = Line.split(" ", 1);
    if (TheInstruction == "STRING") {
      const TheString = Line.split(" ").slice(1).join(" ");
      S.StringsTable.push(TheString);
    } else if (TheInstruction.startsWith("END"))
      return AllCode;
    else
      throw new LLL_InterpreterError("\u041D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u0435 \u0444\u043E\u0440\u043C\u0430\u0442\u0430 \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u0441\u0442\u0440\u043E\u043A: \u0414\u0432\u043E\u0439\u043D\u044B\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u044B \u0441\u0442\u0440\u043E\u043A \u0438\u043C\u0435\u044E\u0442 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 (\u0441\u043B\u0443\u0436\u0430\u0442 \u0440\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u0435\u043C \u0434\u043B\u044F \u0441\u0442\u0440\u043E\u043A \u0432 \u0442\u0430\u0431\u043B\u0438\u0446\u0435).\n	\u0415\u0441\u043B\u0438 \u0445\u043E\u0442\u0438\u0442\u0435 \u0432\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u0441\u0442\u0440\u043E\u043A\u0438 - \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0441\u0442\u0440\u043E\u043A\u0443 \u0441 '\\n'.");
  }
  throw new LLL_InterpreterError(`\u041D\u0435\u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u044B\u0439 \u0431\u043B\u043E\u043A \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u0441\u0442\u0440\u043E\u043A`);
}
function RecursiveInterpret(S, ws) {
  interpreting: while (ws.tkRefillLineBuff()) {
    const Tk = ws.tkGrab();
    S.CurrentInterpretingWord = Tk;
    findingDefinition: for (let i = S.Closures.length - 1; i >= 0; i--) {
      const TheClosure = S.Closures[i];
      const Definition = TheClosure.get(Tk);
      switch (typeof Definition) {
        case "undefined":
          continue findingDefinition;
        case "number":
        //это числовое значение => уверенно кидаем в стек
        case "string":
          S.Stack.push(Definition);
          continue interpreting;
        case "function":
          Definition(S, ws);
          continue interpreting;
        case "object":
          if (Definition instanceof _WordStream) {
            RecursiveInterpret(S, Definition);
          } else continue findingDefinition;
      }
    }
    S.Stack.push(ParseValue(S, Tk));
  }
}
function ParseValue(S, Value) {
  const AsNumber = Number(Value);
  if (!isNaN(AsNumber))
    return S.aux.RtvalueOf_Number(AsNumber);
  else
    return S.aux.RtvalueOf_String(Value);
}
var LLL_InterpreterError = class extends Error {
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Assert,
  AssertStackLength,
  Assert_At,
  Assert_Here,
  ClampNumber,
  ClampToLength,
  CompleteToLength_Prefix,
  FitStringsInLength,
  GetStateTrace,
  IStack,
  IsInteger,
  LLL_EXECUTE,
  LLL_STATE,
  OmitKeysFrom,
  Pop_Float,
  Pop_Integer,
  Pop_String,
  RemoveSuffix,
  ReprAs_Float,
  ReprAs_Integer,
  ReprAs_String,
  RtvalueOf,
  RtvalueOf_Number,
  RtvalueOf_String,
  ThrowRuntimeExc,
  ThrowRuntimeExc_At,
  ThrowRuntimeExc_Here,
  _PrepareCodeLine,
  _WordStream
});
