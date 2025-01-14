import * as LibUtils from "../Utils.js";
import { MaybeReprAs_Number, ReprAs_String } from "./AuxReprConversions.js";
const TARGET_TERMINAL_WIDTH = 60;

/**
 * Возвращает `LLL_STATE`, готовую к красивому выводу в консоль.
 * @param {LLL_STATE} S
 * @returns {string}
 * @see {@link _AuxGetStateStace() source}
 */
export function GetStateTrace(S) {
  let Buf = "Current interpreter's state:\n";
  ;_ScriptMetadataFormatting: {
    Buf += "> ScriptMetadata:\n"
    const Entries = Object.entries(S.ScriptMetadata);
    if (Entries.length == 0) {
      Buf += "\t<empty>\n";
      break _ScriptMetadataFormatting;
    }

    const MaxIndex = Entries.length - 1;
    const IndexLength = MaxIndex.toString().length;
    const MaxKeyLength = [...Entries].sort(( [keyA],[keyB] ) => keyB.length - keyA.length)[0][0].length;

    for (let i = 0; i < Entries.length; i++) {
      const [Key, Value] = Entries[i];
      Buf += "\t";
      Buf += LibUtils.CompleteToLength_Prefix(IndexLength, i.toString());
      Buf += "| ";
      Buf += LibUtils.CompleteToLength_Prefix(MaxKeyLength, Key);
      Buf += " | ";
      Buf += LibUtils.ClampToLength(TARGET_TERMINAL_WIDTH - MaxKeyLength, ReprAs_String(S, Value));
      Buf += "\n";
    }
  };



  ;_StringsTableFormatting: {
    Buf += "> StringsTable:\n"
    if (S.StringsTable.length == 0) {
      Buf += "\t<empty>\n";
      break _StringsTableFormatting;
    }
    
    const MaxIndex = S.StringsTable.length - 1;
    const IndexLength = MaxIndex.toString().length;
    for (let i = 0; i < S.StringsTable.length; i++) {
      Buf += "\t";
      Buf += LibUtils.CompleteToLength_Prefix(IndexLength, i.toString());
      Buf += "| ";
      Buf += LibUtils.ClampToLength(TARGET_TERMINAL_WIDTH, S.StringsTable[i]);
      Buf += "\n";
    }
  };



  ;_StackFormatting: {
    Buf += "> Stack:\n"
    if (S.Stack.length == 0) {
      Buf += "\t<empty>\n";
      break _StackFormatting;
    }
    
    const MaxIndex = S.Stack.length - 1;
    const IndexLength = LibUtils.ClampNumber.OnlyMin(3, MaxIndex.toString().length);
    Buf += "\tTOP| ";
    Buf += LibUtils.ClampToLength(TARGET_TERMINAL_WIDTH, _Represent(S, S.Stack.peek()).toString());
    Buf += "\n";
    for (let i = S.Stack.length - 2; i >= 0; i--) {
      Buf += "\t";
      Buf += LibUtils.CompleteToLength_Prefix(IndexLength, (i - MaxIndex).toString());
      Buf += "| ";
      Buf += LibUtils.ClampToLength(TARGET_TERMINAL_WIDTH, _Represent(S, S.Stack[i]).toString());
      Buf += "\n";
    }
  };



  ;_ClosuresFormatting: {
    Buf += "> Closures:\n"
    if (S.Closures.length == 0) {
      Buf += "\t<empty>\n";
      break _ClosuresFormatting;
    }
    
    const MaxIndex = S.Closures.length - 1;
    const IndexLength = LibUtils.ClampNumber.OnlyMin(3, MaxIndex.toString().length);
    ;{
      const IndexDisplay = "\t" + LibUtils.CompleteToLength_Prefix(IndexLength, "TOP") + "| ";
      const Words = Array.from(S.Closures[S.Closures.length - 1].keys());
      const WordsMosaic = LibUtils.FitStringsInLength(Words, TARGET_TERMINAL_WIDTH, 1);
      Buf += IndexDisplay;
      Buf += WordsMosaic
        .map(it => it.join(" "))
        .join("\n" + IndexDisplay);
      Buf += "\n";
    };
    for (let i = S.Closures.length - 2; i >= 0; i--) {
      const IndexDisplay = "\t"
        + LibUtils.CompleteToLength_Prefix(IndexLength, (i - MaxIndex).toString())
        + "| ";
      const Words = Array.from(S.Closures[i].keys());
      const WordsMosaic = LibUtils.FitStringsInLength(Words, TARGET_TERMINAL_WIDTH, 1);
      Buf += IndexDisplay;
      Buf += WordsMosaic
        .map(it => it.join(" "))
        .join("\n" + IndexDisplay);
      Buf += "\n";
    }
  };
  return Buf;
}



/**
 * @param {LLL_STATE} S 
 * @param {llval_ty} Rtvalue 
 * @returns {llrepr_ANY_ty}
 */
function _Represent(S, Rtvalue) {
  return MaybeReprAs_Number(S, Rtvalue)
    ?? ReprAs_String(S, Rtvalue);
}
