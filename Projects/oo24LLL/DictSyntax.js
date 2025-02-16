import * as aux from "./aAux.js";
import * as CoGr from "./CommonGrammar.js";
import { __Any } from "../Utils-typed.js";
import { InterpretWord } from "./Interpreter.js";
import { LoopBodyFragment, LoopContext } from "./TheMachine.js";



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
    const Fragment = S.RuntimeStateStorage.PostBlock;
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
    const Fragment = S.RuntimeStateStorage.PostBlock;
    aux.Assert(S, Fragment != null,
      "LLL RuntimeException", "XRT_i103");
    const LoopBody = new LoopBodyFragment(Fragment.Words, Fragment.Label);
    LoopEngine(S, LoopBody);
  },

  [CoGr.Instr.LOOP_RESTART]: (S) => {
    aux.Assert(S, S.RuntimeStateStorage.LoopsStack.length > 0,
      "LLL SyntaxError", "ESX_1002");
    S.RuntimeStateStorage.LoopsStack.peek().Pos = 0;
  },

  [CoGr.Instr.LOOP_BREAK]: (S) => {
    aux.Assert(S, S.RuntimeStateStorage.LoopsStack.length > 0,
      "LLL SyntaxError", "ESX_1003");
    S.RuntimeStateStorage.LoopsStack.peek().Available = false;
  },

}));



/**
 * Отвечает за исполнение (интерпретацию) цикла.
 * @param {LLL_STATE} S 
 * @param {LoopBodyFragment} LoopBody 
 */
function LoopEngine(S, LoopBody) {
  const Context = new LoopContext(LoopBody);
  S.RuntimeStateStorage.LoopsStack.push(LoopBody);
  S.RuntimeStateStorage.InterpreterContexts.push(Context);
  while (LoopBody.Available) {
    const Word = LoopBody.Words[LoopBody.Pos++];
    InterpretWord(S, Word);
    if (LoopBody.Pos == LoopBody.Words.length)
      LoopBody.Pos = 0;
  }
  S.RuntimeStateStorage.LoopsStack.pop();
}
