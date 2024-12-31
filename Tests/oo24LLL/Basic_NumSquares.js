import { LLL_EXECUTE, LLL_STATE } from "../../Source/oo24LLL/Interpreter.js";
import * as LibTest from "node:test";

LibTest.describe("Getting cubes of numbers", () => {
  LibTest.it("dup mul, dup mul", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`
      2 dup mul dup mul
    `, S);
    return S.Stack.peek() == 16;
  });
});
