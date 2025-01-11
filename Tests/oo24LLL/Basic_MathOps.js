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



libTest.describe("Fibonacci", () => {

  libTest.it("69th number", () => {

    const S = new LLL_STATE();
    LLL_EXECUTE(`
      0 1 1             ;1,2,3
      dupsub dup sum    ;4
      dupsub dupsub sum ;5
      dupsub dupsub sum ;6
      dupsub dupsub sum ;7
      dupsub dupsub sum ;8
      dupsub dupsub sum ;9
      dupsub dupsub sum ;10
      dupsub dupsub sum ;11
      dupsub dupsub sum ;12
      dupsub dupsub sum ;13
    `, S);
    const NEEDED = 72723460248141;
    return S.Stack.peek() === NEEDED;

  });

});

