import { LLL_STATE } from "../../Source/oo24LLL/TheMachine.js";
import { LLL_EXECUTE } from "../../Source/oo24LLL/Interpreter.js";
import * as libTest from "node:test";

libTest.describe("Getting cubes of numbers", () => {

  libTest.it("dup mul, dup mul", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`
      2 dup mul dup mul
    `, S);

    return S.Stack.peek() === 16;
  });

});
