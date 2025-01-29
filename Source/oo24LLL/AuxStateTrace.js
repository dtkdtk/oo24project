import * as LibUtils from "../Utils.js";
import { MaybeAs_Number, As_String } from "./AuxTyping.js";
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
      Buf += LibUtils.CompleteToLength(IndexLength, i.toString());
      Buf += "| ";
      Buf += LibUtils.CompleteToLength(MaxKeyLength, Key);
      Buf += " | ";
      Buf += LibUtils.ClampToLength(TARGET_TERMINAL_WIDTH - MaxKeyLength, As_String(S, Value));
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
      Buf += LibUtils.CompleteToLength(IndexLength, i.toString());
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
      Buf += LibUtils.CompleteToLength(IndexLength, (i - MaxIndex).toString());
      Buf += "| ";
      Buf += LibUtils.ClampToLength(TARGET_TERMINAL_WIDTH, _Represent(S, S.Stack[i]).toString());
      Buf += "\n";
    }
  };



  /* TODO: Когда появится возможность добавлять слова в 'LLL_STATE#PrimordialDict' - добавить поддержку данных слов. */
  ;_DictFormatting: {
    Buf += "> Dictionary:\n"
    if (S.UserDict.size == 0) {
      Buf += "\t<empty>\n";
      break _DictFormatting;
    }
    
    const IndexDisplay = "\t| "; //* Не индекс, а начало строки. Но ладно.
    const Words = Array.from(S.UserDict.keys());
    const WordsMosaic = LibUtils.FitStringsInLength(Words, TARGET_TERMINAL_WIDTH, 1);
    Buf += IndexDisplay;
    Buf += WordsMosaic
      .map(it => it.join(" "))
      .join("\n" + IndexDisplay);
    Buf += "\n";
  };
  return Buf;
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
