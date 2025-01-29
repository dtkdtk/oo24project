import { WordDefinitionFragment } from "./TheMachine.js";
import * as aux from "./aAux.js";
import * as CoGr from "./CommonGrammar.js";

const _AllComplexConstructions = Object.values(CoGr.Constrct);

/**
 * @internal
 * Словарь СЛОВ СИНТАКСИСА.
 * 
 * @type {LLL_Dictionary}
 */
export default new Map(Object.entries({
  [CoGr.Instr.DEFINE_VAR]: (S) => {
    aux.AssertStackLength(S, 2);
    const VarName = aux.Pop_String(S);
    const Value = S.Stack.pop();
    S.UserDict.set(VarName, Value);
  },

  [CoGr.Constrct.DEFINE_FUNC]: (S) => {
    aux.AssertStackLength(S, 1);
    const VarName = aux.Pop_String(S);
    const Bounds = InterpretCodeblock(S, VarName);
    S.UserDict.set(VarName, Bounds);
  },

  [CoGr.Instr.DELETE_DEFINITION]: (S) => {
    aux.AssertStackLength(S, 1);
    const VarName = aux.Pop_String(S);
    S.UserDict.delete(VarName);
  },

}));



/**
 * @param {LLL_STATE} S 
 * @param {string} Label 
 * @returns {WordDefinitionFragment}
 */
function InterpretCodeblock(S, Label) {
  S.AdditionalLocationInfo = Label;
  const StartPos = S.TheReader.Pos;
  let EndPos = 0;
  let Depth = 0;
  while (!S.TheReader.IsCodeEnd) {
    const Instruction = S.TheReader.GrabUnit();
    if (_AllComplexConstructions.includes(Instruction))
      Depth++;
    else if (Instruction == CoGr.INSTR_END_OF_BLOCK) {
      if (Depth == 0) break;
      Depth--;
    }
    EndPos = S.TheReader.Pos - 1;
  }

  if (S.TheReader.IsCodeEnd) aux.ThrowRuntimeExc(S, "Expected end of the block.");
  S.AdditionalLocationInfo = null;
  return new WordDefinitionFragment(StartPos, EndPos);
}
