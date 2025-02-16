import { LLL_STATE } from "../../Source/oo24LLL/TheMachine.js";
import { LLL_EXECUTE } from "../../Source/oo24LLL/Interpreter.js";
import * as libTest from "node:test";

libTest.describe("Getting cubes of numbers", () => {

  libTest.it("dup [*], dup [*]", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`
      2 dup [*] dup [*]
    `, S);

    return S.Stack.peek() === 16;
  });

});



libTest.describe("Fibonacci", () => {

  libTest.it("69th number", () => {

    const S = new LLL_STATE();
    LLL_EXECUTE(`
      0 1 1             ;1,2,3
      dupsub dup [+]    ;4
      dupsub dupsub [+] ;5
      dupsub dupsub [+] ;6
      dupsub dupsub [+] ;7
      dupsub dupsub [+] ;8
      dupsub dupsub [+] ;9
      dupsub dupsub [+] ;10
      dupsub dupsub [+] ;11
      dupsub dupsub [+] ;12
      dupsub dupsub [+] ;13
    `, S);
    const NEEDED = 72723460248141;
    return S.Stack.peek() === NEEDED;

  });

});

