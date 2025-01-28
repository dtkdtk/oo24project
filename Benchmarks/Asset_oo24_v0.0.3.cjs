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
  MaybeAs_Number: () => MaybeAs_Number,
  OmitKeysFrom: () => OmitKeysFrom,
  Pop_Number: () => Pop_Number,
  Pop_String: () => Pop_String,
  RemoveSuffix: () => RemoveSuffix,
  ReprAs_Number: () => ReprAs_Number,
  ReprAs_String: () => ReprAs_String,
  RtvalueOf: () => RtvalueOf,
  RtvalueOf_Number: () => RtvalueOf_Number,
  RtvalueOf_String: () => RtvalueOf_String,
  TheReaderStream: () => TheReaderStream,
  ThrowRuntimeExc: () => ThrowRuntimeExc,
  ThrowRuntimeExc_At: () => ThrowRuntimeExc_At,
  ThrowRuntimeExc_Here: () => ThrowRuntimeExc_Here,
  WordDefinitionFragment: () => WordDefinitionFragment,
  __Any: () => __Any
});
module.exports = __toCommonJS(include_exports);

// Source/Utils-typed.js
var IStack = class extends Array {
  peek() {
    return this[this.length - 1];
  }
};
var __Any = void 0;

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
    const MaxKeyLength = [...Entries].sort(([keyA], [keyB]) => keyB.length - keyA.length)[0][0].length;
    for (let i = 0; i < Entries.length; i++) {
      const [Key, Value] = Entries[i];
      Buf += "	";
      Buf += CompleteToLength_Prefix(IndexLength, i.toString());
      Buf += "| ";
      Buf += CompleteToLength_Prefix(MaxKeyLength, Key);
      Buf += " | ";
      Buf += ClampToLength(TARGET_TERMINAL_WIDTH - MaxKeyLength, ReprAs_String(S, Value));
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
    Buf += ClampToLength(TARGET_TERMINAL_WIDTH, _Represent(S, S.Stack.peek()).toString());
    Buf += "\n";
    for (let i = S.Stack.length - 2; i >= 0; i--) {
      Buf += "	";
      Buf += CompleteToLength_Prefix(IndexLength, (i - MaxIndex).toString());
      Buf += "| ";
      Buf += ClampToLength(TARGET_TERMINAL_WIDTH, _Represent(S, S.Stack[i]).toString());
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
function _Represent(S, Rtvalue) {
  return MaybeAs_Number(S, Rtvalue) ?? ReprAs_String(S, Rtvalue);
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

// Source/oo24LLL/AuxReprConversions.js
function RtvalueOf(S, Repr) {
  return Repr;
}
function RtvalueOf_Number(S, NumRepr) {
  return NumRepr;
}
function RtvalueOf_String(S, StrRepr) {
  return StrRepr;
}
function MaybeAs_Number(S, Rtvalue) {
  if (typeof Rtvalue == "number")
    return Rtvalue;
  const AsNumber = Number(Rtvalue);
  if (isNaN(AsNumber))
    return null;
  return AsNumber;
}
function ReprAs_Number(S, Rtvalue) {
  const AsNumber = MaybeAs_Number(S, Rtvalue);
  if (AsNumber === null)
    return ThrowRuntimeExc_Here(S, `The given value cannot be converted to Integer.`);
  ;
  return AsNumber;
}
function ReprAs_String(S, Rtvalue) {
  return String(Rtvalue);
}
function Pop_Number(S) {
  return ReprAs_Number(S, S.Stack.pop());
}
function Pop_String(S) {
  return ReprAs_String(S, S.Stack.pop());
}

// Source/oo24LLL/DictStd.js
var DictStd_default = new Map(Object.entries({
  ////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Дублировать верхушку стека.
   * @signature `[value] dup`
   */
  dup: (S, ws) => {
    AssertStackLength(S, 1);
    S.Stack.push(S.Stack.peek());
  },
  /**
   * Дублирует СУБ-верхушку стека.
   * @signature `[value] [(top)] dupsub`
   */
  dupsub: (S, ws) => {
    AssertStackLength(S, 2);
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
    AssertStackLength(S, 1);
    S.Stack.pop();
  },
  ////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Получает из таблицы строк строку с указанным индексом (`strindex`)
   * и возвращает её.
   * @signature `[strindex] string`
   */
  string: (S, ws) => {
    AssertStackLength(S, 1);
    const StrIndex = Pop_Number(S);
    Assert_Here(S, StrIndex >= 0 && StrIndex < S.StringsTable.length, `String with index '${StrIndex}' not found.`);
    const StringFromTable = S.StringsTable[StrIndex];
    Assert_Here(S, StringFromTable !== void 0, `String not found.`);
    S.Stack.push(RtvalueOf_String(S, StringFromTable));
  },
  /**
   * Конкатенирует пред-вершину стека с вершиной.
   * @signature `[dest] [source] concat`
   */
  concat: (S, ws) => {
    AssertStackLength(S, 2);
    const Source = Pop_String(S);
    const Dest = Pop_String(S);
    S.Stack.push(RtvalueOf(S, Source.concat(Dest)));
  },
  /**
   * Выводит вершину стека в консоль, ИЗВЛЕКАЯ её.
   * @signature `[value] print`
   */
  print: (S, ws) => {
    AssertStackLength(S, 1);
    S.StdOUT.write(Pop_String(S));
  },
  ////////////////////////////////////////////////////////////////////////////////////////
  /*
   * Базовые БИНАРНЫЕ математические операции.
   * Все имеют сигнатуру `[from] [to] OPERATION`
   */
  sum: (S, ws) => {
    AssertStackLength(S, 2);
    const From = Pop_Number(S);
    const To = Pop_Number(S);
    S.Stack.push(RtvalueOf(S, From + To));
  },
  sub: (S, ws) => {
    AssertStackLength(S, 2);
    const From = Pop_Number(S);
    const To = Pop_Number(S);
    S.Stack.push(RtvalueOf(S, From - To));
  },
  mul: (S, ws) => {
    AssertStackLength(S, 2);
    const From = Pop_Number(S);
    const To = Pop_Number(S);
    S.Stack.push(RtvalueOf(S, From * To));
  },
  div: (S, ws) => {
    AssertStackLength(S, 2);
    const From = Pop_Number(S);
    const To = Pop_Number(S);
    S.Stack.push(RtvalueOf(S, ~~(From / To)));
  },
  mod: (S, ws) => {
    AssertStackLength(S, 2);
    const From = Pop_Number(S);
    const To = Pop_Number(S);
    S.Stack.push(RtvalueOf(S, From % To));
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
   * @type {Record<string, llval_t>}
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
   * @type {libUtilsTy.IStack<llval_t>}
   * @readonly
   */
  Stack = new IStack();
  /**
   * Стек *замыканий*: областей видимости слов(функций) и переменных.
   * @type {libUtilsTy.IStack<Map<string, llval_t | NativeJsFunction | TheReaderStream>>}
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
  /**
   * Текущий поток ввода (`stdin`)
   */
  StdIN = process.stdin;
  /**
   * Текущий поток вывода (`stdout`)
   */
  StdOUT = process.stdout;
  /**
   * Текущий поток вывода ошибок (`stderr`)
   */
  StdERR = process.stderr;
};
var TK_COMMENT_LINE_START = ";";
var TK_INLINE_COMMENT_START = "(";
var TK_INLINE_COMMENT_END = ")";
var _HandleTokenResult = {
  NOTHING: 0,
  CONTINUE_LOOP: 1,
  DRAIN_BUF: 2
};
var TheReaderStream = class {
  /** @type {libUtilsTy.IStack<WordDefinitionFragment>} */
  #Bounds;
  Pos = 0;
  /**
   * Осуществляет "переход" к интерпретации определения (некого фрагмента кода)
   * @param {WordDefinitionFragment} Definition
   */
  GotoDefinition(Definition) {
    this.#Bounds.push(Definition);
    this.Pos = Definition.StartsAt;
  }
  /**
   * Антоним {@link GotoDefinition()} - осуществляет ОБРАТНЫЙ переход,
   * "выход" из интерпретации определения.
   */
  ExitDefinition() {
    this.#Bounds.pop();
    this.IsFragmentEnd = true;
    if (this.#Bounds.length == 0)
      this.IsCodeEnd = true;
  }
  #LineIndex = 0;
  get LineIndex() {
    return this.#LineIndex;
  }
  /** Позиция перед извлечением единицы кода. @type {number} */
  #PreviousPosition = 0;
  /** @type {string} */
  #Buf = "";
  /** @type {string} */
  #AllCode;
  /** Внутреннее состояние интерпретатора. */
  #InternalState = {
    /** Режим интерпретации СТРОЧНОГО комментария? */
    CommentLine: false,
    /** Режим интерпретации ВСТРОЕННОГО комментария? */
    InlineComment: false
  };
  /** Мы достигли конца кода? */
  IsCodeEnd = false;
  /** Мы достигли конца ФРАГМЕНТА кода? (текущего интерпретируемого определения) */
  IsFragmentEnd = false;
  /** Дополнительные опции чтения/интерпретации. Регулируются извне. */
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
    this.#Bounds = new IStack(new WordDefinitionFragment(0, AllCode.length - 1));
  }
  /**
   * *Извлекает из потока кода* текущую единицу кода (слово, строку и т.д.)
   * 
   * Проверка конца кода на вашей совести!
   * @returns {string}
   */
  GrabUnit() {
    this.IsFragmentEnd = false;
    this.#PreviousPosition = this.Pos;
    while (this.Pos < this.#Bounds.peek().EndsAt) {
      const Tk = this.#AllCode[this.Pos];
      this.Pos++;
      let CurrentStatus = this.#MaybeHandle_Newline(Tk) || this.#MaybeHandle_CommentLine(Tk) || this.#MaybeHandle_InlineComment(Tk) || this.#MaybeHandle_InterpretingUnitBound(Tk);
      if (CurrentStatus == 1) continue;
      else if (CurrentStatus == 2) return this.#DrainBuffer();
      this.#Buf += Tk;
    }
    this.ExitDefinition();
    return __Any;
  }
  /**
   * Отменяет предыдущее извлечение из потока.
   */
  RevertGrabbing() {
    this.Pos = this.#PreviousPosition;
  }
  /**
   * @returns {string}
   */
  #DrainBuffer() {
    const Word = this.#Buf;
    this.#Buf = "";
    return Word;
  }
  /**
   * Часть {@link GrabUnit()}, отвечающая за обработку переходов на новую строку.
   * @param {string} Tk 
   * @returns {0 | 1 | 2} `0` - ничего не найдено, идём дальше; `1` - обработано, начинаем новый цикл; `2` - делаем возврат из {@link GrabUnit()} (возвращаем буфер)
   */
  #MaybeHandle_Newline(Tk) {
    if (Tk == "\n") {
      this.#LineIndex++;
      if (this.#Buf.length > 0 && this.Options.DrainOnNewline)
        return _HandleTokenResult.DRAIN_BUF;
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    if (Tk == "\r")
      return _HandleTokenResult.CONTINUE_LOOP;
    return _HandleTokenResult.NOTHING;
  }
  #MaybeHandle_CommentLine(Tk) {
    if (!this.Options.HandleCommentLines)
      return _HandleTokenResult.NOTHING;
    if (Tk == TK_COMMENT_LINE_START) {
      this.#InternalState.CommentLine = true;
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    if (Tk == "\n") {
      this.#InternalState.CommentLine = false;
      if (this.#Buf.length > 0 && this.Options.DrainOnNewline)
        return _HandleTokenResult.DRAIN_BUF;
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    if (this.#InternalState.CommentLine)
      return _HandleTokenResult.CONTINUE_LOOP;
    return _HandleTokenResult.NOTHING;
  }
  #MaybeHandle_InlineComment(Tk) {
    if (!this.Options.HandleInlineComments)
      return _HandleTokenResult.NOTHING;
    if (Tk == TK_INLINE_COMMENT_START) {
      this.#InternalState.InlineComment = true;
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    if (this.#InternalState.InlineComment && Tk == TK_INLINE_COMMENT_END) {
      this.#InternalState.InlineComment = false;
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    if (this.#InternalState.InlineComment)
      return _HandleTokenResult.CONTINUE_LOOP;
    return _HandleTokenResult.NOTHING;
  }
  /**
   * Граница интересующей нас единицы кода: пробела, перехода на новую строку и т.д.
   */
  #MaybeHandle_InterpretingUnitBound(Tk) {
    if (Tk == this.Options.UnitBound) {
      if (this.#Buf.length > 0 || !this.Options.SkipEmptyUnits)
        return _HandleTokenResult.DRAIN_BUF;
      return _HandleTokenResult.CONTINUE_LOOP;
    }
    return _HandleTokenResult.NOTHING;
  }
};
var WordDefinitionFragment = class {
  /** @type {number} */
  StartsAt;
  /** @type {number} */
  EndsAt;
  /**
   * @param {number} StartIndex 
   * @param {number} EndIndex 
   */
  constructor(StartIndex, EndIndex) {
    this.StartsAt = StartIndex;
    this.EndsAt = EndIndex;
  }
};

// Source/oo24LLL/Interpreter.js
function LLL_EXECUTE(AllCode, S = new LLL_STATE()) {
  const Reader = new TheReaderStream(AllCode);
  InterpretPrelude(S, Reader);
  if (AllCode.length == 0) return;
  RecursiveInterpret(S, Reader);
}
function InterpretPrelude(S, Reader) {
  S.CurrentInterpretingWord = "<prelude>";
  let Instruction;
  while (Instruction = Reader.GrabUnit(), !Reader.IsCodeEnd) {
    switch (Instruction) {
      case "META": {
        let PropertyKey = Reader.GrabUnit();
        Reader.Options.HandleInlineComments = false;
        Reader.Options.HandleCommentLines = false;
        Reader.Options.UnitBound = "\n";
        let PropertyValue = Reader.GrabUnit();
        Reader.Options.HandleInlineComments = true;
        Reader.Options.HandleCommentLines = true;
        Reader.Options.UnitBound = " ";
        PropertyKey = RemoveSuffix(PropertyKey, ":");
        S.ScriptMetadata[PropertyKey] = ParseValue(S, PropertyValue);
        break;
      }
      case "STRINGS-TABLE:": {
        return InterpretStringsTable(S, Reader);
      }
      default:
        Reader.RevertGrabbing();
        return;
    }
  }
}
function InterpretStringsTable(S, Reader) {
  Reader.Options.SkipEmptyUnits = false;
  Reader.Options.HandleInlineComments = false;
  Reader.Options.HandleCommentLines = false;
  Reader.Options.UnitBound = "\n";
  let Line;
  interpreting: while (Line = Reader.GrabUnit(), !Reader.IsCodeEnd) {
    let Content = "";
    if (Line == "STRING") {
      readingString: while (!Reader.IsCodeEnd) {
        const Line2 = Reader.GrabUnit();
        if (Line2 == "END") {
          Content = HandleCharacterEscaping(S, Content);
          S.StringsTable.push(Content);
          continue interpreting;
        }
        if (Line2 == "\\END") {
          if (Content.length > 0)
            Content += "\n";
          Content += "END";
          continue readingString;
        }
        if (Content.length > 0)
          Content += "\n";
        Content += Line2;
      }
      return ThrowRuntimeExc_Here(S, `Expected "END" at end of string.`);
    } else if (Line == "END-TABLE") {
      Reader.Options.HandleCommentLines = true;
      Reader.Options.HandleInlineComments = true;
      Reader.Options.DrainOnNewline = true;
      Reader.Options.UnitBound = " ";
      Reader.Options.SkipEmptyUnits = true;
      return;
    } else
      return ThrowRuntimeExc_Here(S, `Failed to process line from string table block:`);
  }
  return ThrowRuntimeExc_Here(S, `Expected "END-TABLE" at end of string table block.`);
}
function RecursiveInterpret(S, Reader) {
  let Tk;
  interpreting: while (Tk = Reader.GrabUnit(), !Reader.IsCodeEnd) {
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
          Definition(S, Reader);
          continue interpreting;
        /*case "object": //отложенное вычисление?..
          if (Definition instanceof TheReaderStream) {
            RecursiveInterpret(S, Definition);
          }
          else continue findingDefinition;*/
        default:
          ThrowRuntimeExc_Here(S, `Unsupported JavaScript-runtime datatype: '${typeof Tk}'`);
      }
    }
    S.Stack.push(ParseValue(S, Tk));
  }
}
function HandleCharacterEscaping(S, AllCode) {
  let NewCode = "";
  let PreviousIndex = 0;
  theLoop: while (true) {
    const MatchIndex = AllCode.indexOf("\\", PreviousIndex + 2);
    if (MatchIndex == -1) break;
    if (MatchIndex + 1 == AllCode.length)
      return ThrowRuntimeExc_Here(S, `Expected escape character, got end of string`);
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
        return ThrowRuntimeExc_Here(S, `Non-existent special character: '\\${AllCode[MatchIndex + 1]}'`);
    }
  }
  NewCode += AllCode.slice(PreviousIndex, AllCode.length);
  return NewCode;
}
function ParseValue(S, Value) {
  const AsNumber = Number(Value);
  if (!isNaN(AsNumber))
    return RtvalueOf_Number(S, AsNumber);
  else
    return RtvalueOf_String(S, Value);
}
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
  MaybeAs_Number,
  OmitKeysFrom,
  Pop_Number,
  Pop_String,
  RemoveSuffix,
  ReprAs_Number,
  ReprAs_String,
  RtvalueOf,
  RtvalueOf_Number,
  RtvalueOf_String,
  TheReaderStream,
  ThrowRuntimeExc,
  ThrowRuntimeExc_At,
  ThrowRuntimeExc_Here,
  WordDefinitionFragment,
  __Any
});
