import * as aux from "./aAux.js";
import * as CoGr from "./CommonGrammar.js";
import { __Any } from "../Utils-typed.js";



/**
 * @internal
 * Словарь СЛОВ СИНТАКСИСА.
 * 
 * @type {Dictionary}
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
    const Fragment = S.StateStorage.PostBlock;
    aux.Assert(S, Fragment != null,
      "LLL RuntimeException", "XRT_i103");
    Fragment.Label = VarName;
    S.UserDict.set(VarName, Fragment);
  },

  [CoGr.Instr.DELETE_DEFINITION]: (S) => {
    aux.AssertStackLength(S, 1);
    const VarName = aux.Pop_String(S);
    S.UserDict.delete(VarName);
  },
  
  [CoGr.Constrct.LOOP]: (S) => {
    
  },

}));




