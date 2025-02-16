import * as LibUtils from "../../Utils.js";
import { MaybeAs_Number, As_String } from "./AuxTyping.js";
const TARGET_TERMINAL_WIDTH = 60;



/**
 * @param {LLL_STATE} S 
 * @returns {string}
 */
GetStateTrace.Location = function(S) {
  let Buf = "\t";
  Buf += S.RuntimeStateStorage.PseudoScope.join("/") || "<top-level>";
  Buf += "\n";
  return Buf;
}

/**
 * @param {LLL_STATE} S 
 * @returns {string}
 */
GetStateTrace.Stack = function(S) {
  let Buf = "";
  if (S.Stack.length == 0) {
    Buf += "\t<empty>\n";
    return Buf;
  }
  
  const MaxIndex = S.Stack.length - 1;
  const IndexLength = LibUtils.ClampNumber.OnlyMin(3, MaxIndex.toString().length);
  Buf += "\tTOP| ";
  Buf += LibUtils.ClampToLength(TARGET_TERMINAL_WIDTH, _Represent(S, S.Stack.peek()).toString());
  Buf += "\n";
  for (let i = S.Stack.length - 2; i >= 0; i--) {
    Buf += "\t";
    Buf += LibUtils.CompleteToLength(IndexLength, (i - MaxIndex).toString());
    Buf += "| ";
    Buf += LibUtils.ClampToLength(TARGET_TERMINAL_WIDTH, _Represent(S, S.Stack[i]).toString());
    Buf += "\n";
  }
  return Buf;
}

/**
 * @param {LLL_STATE} S 
 * @returns {string}
 */
GetStateTrace.Dict = function(S) {
  let Buf = "";
  if (S.UserDict.size == 0) {
    Buf += "\t<empty>\n";
    return Buf;
  }
  
  const IndexDisplay = "\t| "; //* Не индекс, а начало строки. Но ладно.
  const Words = Array.from(S.UserDict.keys());
  const WordsMosaic = LibUtils.FitStringsInLength(Words, TARGET_TERMINAL_WIDTH, 1);
  Buf += IndexDisplay;
  Buf += WordsMosaic
    .map(it => it.join(" "))
    .join("\n" + IndexDisplay);
  Buf += "\n";
  return Buf;
}

/**
 * @param {LLL_STATE} S 
 * @returns {string}
 */
GetStateTrace.ScriptMetadata = function(S) {
  let Buf = "";
  const Entries = Object.entries(S.ScriptMetadata);
  if (Entries.length == 0) {
    Buf += "\t<empty>\n";
    return Buf;
  }

  const MaxIndex = Entries.length - 1;
  const IndexLength = MaxIndex.toString().length;
  const MaxKeyLength = [...Entries].sort(( [keyA],[keyB] ) => keyB.length - keyA.length)[0][0].length;

  for (let i = 0; i < Entries.length; i++) {
    const [Key, Value] = Entries[i];
    Buf += "\t";
    Buf += LibUtils.CompleteToLength(IndexLength, i.toString());
    Buf += "| ";
    Buf += LibUtils.CompleteToLength(MaxKeyLength, Key);
    Buf += " | ";
    Buf += LibUtils.ClampToLength(TARGET_TERMINAL_WIDTH - MaxKeyLength, As_String(S, Value));
    Buf += "\n";
  }
  return Buf;
}

/**
 * @param {LLL_STATE} S 
 * @returns {string}
 */
GetStateTrace.StringsTable = function(S) {
  let Buf = "";
  if (S.StringsTable.length == 0) {
    Buf += "\t<empty>\n";
    return Buf;
  }
  
  const MaxIndex = S.StringsTable.length - 1;
  const IndexLength = MaxIndex.toString().length;
  for (let i = 0; i < S.StringsTable.length; i++) {
    Buf += "\t";
    Buf += LibUtils.CompleteToLength(IndexLength, i.toString());
    Buf += "| ";
    Buf += LibUtils.ClampToLength(TARGET_TERMINAL_WIDTH, S.StringsTable[i]);
    Buf += "\n";
  }
  return Buf;
}

/**
 * Возвращает `LLL_STATE`, готовую к красивому выводу в консоль.
 * @param {LLL_STATE} S
 * @returns {string}
 * @see {@link _AuxGetStateStace() source}
 */
export function GetStateTrace(S) {
  return "Current interpreter's state:\n"
    + "> Location:\n"       + GetStateTrace.Location(S)
    + "> Stack:\n"          + GetStateTrace.Stack(S)
    + "> Dictionary:\n"     + GetStateTrace.Dict(S)
    + "> ScriptMetadata:\n" + GetStateTrace.ScriptMetadata(S)
    + "> StringsTable:\n"   + GetStateTrace.StringsTable(S)
    + "--\n"
}



/**
 * @param {LLL_STATE} S 
 * @param {LLL_Value} Rtvalue 
 * @returns {LLL_Value}
 */
function _Represent(S, Rtvalue) {
  return MaybeAs_Number(S, Rtvalue)
    ?? As_String(S, Rtvalue);
}
