var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Source/include.js
var include_exports = {};
__export(include_exports, {
  ClampNumber: () => ClampNumber,
  ClampToLength: () => ClampToLength,
  CompleteToLength_Prefix: () => CompleteToLength_Prefix,
  FitStringsInLength: () => FitStringsInLength,
  IStack: () => IStack,
  LLL_EXECUTE: () => LLL_EXECUTE,
  LLL_STATE: () => LLL_STATE,
  OmitKeysFrom: () => OmitKeysFrom,
  _AuxGetStateStace: () => _AuxGetStateStace
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
    const CurrentLength = Buf[Buf.length - 1].reduce((accum, cur) => accum + cur, 0) + Buf[Buf.length - 1].length * DelimiterLength;
    if (CurrentLength + Str.length > TargetLength)
      Buf.push([Str]);
    else
      Buf[Buf.length - 1].push(Str);
  }
  return Buf;
}

// Source/oo24LLL/AuxStateTrace.js
var TARGET_TERMINAL_WIDTH = 100;
function _AuxGetStateStace(S) {
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
      Buf += ClampToLength(TARGET_TERMINAL_WIDTH - MaxKeyLength, Value);
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
    Buf += ClampToLength(TARGET_TERMINAL_WIDTH, S.Stack.peek());
    Buf += "\n";
    for (let i = S.Stack.length - 2; i >= 0; i--) {
      Buf += "	";
      Buf += CompleteToLength_Prefix(IndexLength, i.toString());
      Buf += "| ";
      Buf += ClampToLength(TARGET_TERMINAL_WIDTH, S.Stack[i]);
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
   * Конкатенирует пред-вершину стека с вершиной.
   * @signature `[dest] [source] concat`
   */
  concat: (S, ws) => {
    S.aux.AssertStackLength(2);
    const Source = S.Stack.pop();
    const Dest = S.Stack.pop();
    S.Stack.push(String(Source).concat(Dest));
  },
  /**
   * Выводит вершину стека в консоль, ИЗВЛЕКАЯ её.
   * @signature `[value] print`
   */
  print: (S, ws) => {
    S.aux.AssertStackLength(1);
    console.log(S.Stack.pop());
  },
  ////////////////////////////////////////////////////////////////////////////////////////
  /*
   * Базовые БИНАРНЫЕ математические операции.
   * Все имеют сигнатуру `[from] [to] OPERATION`
   */
  sum: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.AsNumber(S.Stack.pop());
    const To = S.aux.AsNumber(S.Stack.pop());
    S.Stack.push(From + To);
  },
  sub: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.AsNumber(S.Stack.pop());
    const To = S.aux.AsNumber(S.Stack.pop());
    S.Stack.push(From - To);
  },
  mul: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.AsNumber(S.Stack.pop());
    const To = S.aux.AsNumber(S.Stack.pop());
    S.Stack.push(From * To);
  },
  div: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.AsNumber(S.Stack.pop());
    const To = S.aux.AsNumber(S.Stack.pop());
    S.Stack.push(From / To);
  },
  mod: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.AsNumber(S.Stack.pop());
    const To = S.aux.AsNumber(S.Stack.pop());
    S.Stack.push(From % To);
  }
}));

// Source/oo24LLL/DictSyntax.js
var DictSyntax_default = new Map(Object.entries({
  SYNTWORD: () => {
  }
}));

// Source/oo24LLL/Interpreter.js
var import_node_assert = __toESM(require("node:assert"), 1);
var TK_COMMENT_START = ";";
function LLL_EXECUTE(AllCode, S = new LLL_STATE()) {
  AllCode = InterpretPrelude(AllCode, S);
  if (AllCode.length == 0) return;
  const TheStream = new WordStream(AllCode);
  RecursiveInterpret(S, TheStream);
}
var LLL_STATE = class {
  /**
   * @type {Record<string, prim>}
   * @readonly
   */
  ScriptMetadata = {};
  /**
   * @type {}
   * @readonly
   */
  Pragmas = {};
  /**
   * @type {string[]}
   * @readonly
   */
  StringsTable = [];
  /**
   * @type {LibUtilsTy.IStack<prim>}
   * @readonly
   */
  Stack = new IStack();
  /**
   * Стек *замыканий*: областей видимости слов(функций) и переменных.
   * @type {LibUtilsTy.IStack<Map<string, prim | NativeJsFunction | WordStream>>}
   * @readonly
   */
  Closures = new IStack(
    //Замыкания по умолчанию:
    DictSyntax_default,
    DictStd_default,
    /* @__PURE__ */ new Map()
  );
  /**
   * Набор вспомогательных функций.
   * @readonly
   */
  aux = {
    //Использовать исключительно стрелочные функции!!!
    /**
     * Выбрасывает RuntimeException.
     * @param {string} Msg
     * @returns {never}
     */
    ThrowRuntimeExc: (Msg) => {
      console.error("LLL Runtime exception: " + Msg + "\n");
      console.error(this.aux.GetStateTrace());
      throw "LLL RuntimeException";
    },
    /**
     * Специализация `ThrowRuntimeExc` с пояснением места, где возникла ошибка.
     * @param {string} Where 
     * @param {string} Msg 
     * @returns {never}
     */
    ThrowRuntimeExc_At: (Where, Msg) => this.aux.ThrowRuntimeExc(`'${Where}': ${Msg}`),
    /**
     * Проверяет, достаточно ли значений в стеке.
     * @param {number} Needed
     * @param {string} ThisFnName
     * @returns {void | never}
     */
    AssertStackLength: (Needed) => {
      if (this.Stack.length < Needed)
        this.aux.ThrowRuntimeExc_At(this.CurrentInterpretingWord, `Not enough values on stack.
	Expected '${Needed}', stack contains '${this.Stack.length}'.`);
    },
    /**
     * Возвращает `LLL_STATE`, готовую к выводу в консоль.
     * @returns {string}
     */
    GetStateTrace: () => _AuxGetStateStace(this),
    /**
     * Конвертирует значение в число.
     * При неудаче выкидывает исключение.
     * @param {prim} Val
     * @returns {number | never}
     */
    AsNumber: (Val) => {
      const Num = Number(Val);
      if (isNaN(Num))
        return this.aux.ThrowRuntimeExc_At(this.CurrentInterpretingWord, `Expected number, received '${Val}'.`);
      return Num;
    },
    /**
     * Конвертирует указанное значение в нужный Runtime-тип данных.
     * Грубо говоря, "парсит" строку и пытается конвертировать в числовой тип данных.
     * @param {string} Value
     * @returns {prim}
     */
    ResolveValue
  };
  /**
   * Интерпретируемое в данный момент слово.
   * @type {string}
   * @readonly
   */
  CurrentInterpretingWord;
  //Ответственность закреплена за 'RecursiveInterpret'
};
function InterpretPrelude(AllCode, S) {
  while (AllCode.length > 0) {
    let [Line, ...OtherLines] = AllCode.split("\n");
    AllCode = OtherLines.join("\n");
    Line = PrepareCodeLine(Line);
    if (Line.length == 0) continue;
    const ParsedLine = Line.split(" ");
    switch (ParsedLine[0]) {
      case "META": {
        (0, import_node_assert.default)(ParsedLine.length > 2, "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0434\u0438\u0440\u0435\u043A\u0442\u0438\u0432\u044B 'META'. \u041E\u0436\u0438\u0434\u0430\u043B\u0441\u044F \u043A\u043B\u044E\u0447 \u0438 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u044F.");
        let [Key, Value] = ParsedLine.slice(1);
        Value = ResolveValue(Value);
        Key = Key.split(TK_COMMENT_START);
        Key = removeSuffix(Key, ":");
        S.ScriptMetadata[Key] = ResolveValue(Value);
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
          if (Definition instanceof WordStream) {
            RecursiveInterpret(S, Definition);
          } else continue findingDefinition;
      }
    }
    S.Stack.push(ResolveValue(Tk));
  }
}
function PrepareCodeLine(Line) {
  return Line.split(";", 1)[0].replaceAll(/\(.*?\)/g, "").replaceAll(/( )+/g, " ").trim();
}
function ResolveValue(Value) {
  const AsNumber = Number(Value);
  if (!isNaN(AsNumber))
    return AsNumber;
  else
    return Value;
}
var WordStream = class {
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
      RawLine = PrepareCodeLine(RawLine);
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
var LLL_InterpreterError = class extends Error {
};
function removeSuffix(Str, Suffix) {
  const Index = Str.lastIndexOf(Suffix);
  if (Index == -1)
    return Str;
  else
    return Str.slice(0, Index);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ClampNumber,
  ClampToLength,
  CompleteToLength_Prefix,
  FitStringsInLength,
  IStack,
  LLL_EXECUTE,
  LLL_STATE,
  OmitKeysFrom,
  _AuxGetStateStace
});
