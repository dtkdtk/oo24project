import { LLL_STATE } from "../../Source/oo24LLL/TheMachine.js";
import { LLL_EXECUTE } from "../../Source/oo24LLL/Interpreter.js";
import * as libTest from "node:test";

libTest.describe("Testing stdlib", () => {

  libTest.it("concat: normal usage", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`
STRINGS_TABLE...
^START
FirstWord
^END

^START
SecondWord
^END

^START
ThirdWord
^END
...END_TABLE

1 string
" " concat
2 string concat
" " concat
3 string concat
    `, S);

    return S.Stack.length == 1 && S.Stack.peek() === "FirstWord SecondWord ThirdWord"
  });

});
