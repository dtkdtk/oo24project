import { LLL_EXECUTE, LLL_STATE } from "../../Source/oo24LLL/Interpreter.js";

const S = new LLL_STATE();

LLL_EXECUTE(`
  2 dup mul
`, S);

console.log(S.aux.GetStateTrace());
