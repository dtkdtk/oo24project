import { Labelled } from "../Utils-typed.js";
import * as aux from "./aAux.js";
import { WordDefinitionFragment } from "./TheMachine.js";

const Complex = {
  DEFINE: "DEFINE...",
};
const _AllComplexConstructions = Object.values(Complex);

/**
 * @internal
 * Словарь СЛОВ СИНТАКСИСА.
 * 
 * @type {Labelled<Map<string, NativeJsFunction>>}
 */
export default Labelled("<lang>", new Map(Object.entries({
  DEFINE: (S, Reader) => {
    aux.AssertStackLength(S, 2);
    const VarName = aux.Pop_String(S);
    const Value = S.Stack.pop();
    S.Closures.peek().set(VarName, Value);
  },

  [Complex.DEFINE]: (S, Reader) => {
    const VarName = aux.Pop_String(S);
    const Bounds = InterpretCodeblock(S, Reader, VarName);
    console.log("<<" + Reader.__AllCode.slice(Bounds.StartsAt, Bounds.EndsAt + 1) + ">>");
    S.Closures.peek().set(VarName, Bounds);
  },
})));



/**
 * @param {LLL_STATE} S 
 * @param {TheReaderStream} Reader 
 * @param {string} Label 
 * @returns {WordDefinitionFragment}
 */
function InterpretCodeblock(S, Reader, Label) {
  const StartPos = Reader.Pos;
  let Depth = 0;
  let Instruction;
  while (Instruction = Reader.GrabUnit(), true) {
    if (_AllComplexConstructions.includes(Instruction))
      Depth++;
    else if (Instruction == BlockEndInstr) {
      if (Depth == 0) break;
      Depth--;
    }
    else if (Reader.IsCodeEnd)
      return aux.ThrowRuntimeExc_At(S, Label, "Expected end of the block.");
  }
  return new WordDefinitionFragment(StartPos, Reader.Pos - BlockEndInstr.length);
}
