import { LLL_STATE } from "../../Source/oo24LLL/TheMachine.js";
import { LLL_EXECUTE } from "../../Source/oo24LLL/Interpreter.js";
import * as libTest from "node:test";

libTest.describe("'LOOP' instruction", () => {

  libTest.it("basic: 1 iteration", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`
      11
      LOOP...
        dup
        [+] 11 ;22
        dup
        [+] 11 ;33
        dup
        [+] 11 ;44
        dup
        [+] 11 ;55
      ...END
    `, S);

    return S.Stack.length == 5
      && S.Stack[0] == 11
      && S.Stack[1] == 22
      && S.Stack[2] == 33
      && S.Stack[3] == 44
      && S.Stack[4] == 55;
  });

});
