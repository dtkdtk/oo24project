import { LLL_STATE } from "../../Source/oo24LLL/TheMachine.js";
import { LLL_EXECUTE } from "../../Source/oo24LLL/Interpreter.js";
import * as libTest from "node:test";

libTest.describe("Parsing Prelude", () => {

  libTest.it("explicit end of prelude", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`
      PRELUDE...
      ...END_PRELUDE
      11
    `, S);

    return S.Stack.length == 1 && S.Stack.peek() === 11;
  });

  libTest.it("implicit end of prelude", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`
      11
    `, S);

    return S.Stack.length == 1 && S.Stack.peek() === 11;
  });

  libTest.it("implicit end of prelude (inline)", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`11`, S);

    return S.Stack.length == 1 && S.Stack.peek() === 11;
  });

  libTest.it("implicit end of prelude (inline 2 words)", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`11 22 (3)`, S);

    return S.Stack[0] === 11 && S.Stack[1] === 22 && S.Stack.length == 2;
  });

  libTest.it("metadata & implicit end of prelude", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`
      META key1 value1
      META key2 value2
      META 3 333
      123
    `, S);

    return S.Stack.length == 1
      && S.ScriptMetadata["key1"] === "value1"
      && S.ScriptMetadata["key2"] === "value2"
      && S.ScriptMetadata["3"] === "333";
  });

  libTest.it("metadata & explicit end of prelude", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`
      PRELUDE...
      META key1 value1
      META key2 value2
      META 3 333
      ...END_PRELUDE
      123
    `, S);

    return S.Stack.length == 1
      && S.ScriptMetadata["key1"] === "value1"
      && S.ScriptMetadata["key2"] === "value2"
      && S.ScriptMetadata["3"] === "333";
  });

});



libTest.describe("Difficult cases", () => {

  libTest.it("empty inline comment instead of space", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`111()222`, S);

    return S.Stack.length == 2 && S.Stack.peek() === 222;
  });

  libTest.it("skipping comments in strings + strings with spaces", () => {
    const S = new LLL_STATE();
    LLL_EXECUTE(`
      "aaa()bbb"
      "aaa;bbb"
      "aaa bbb"
    `, S);

    return S.Stack.length == 3
      && S.Stack[0] === "aaa()bbb"
      && S.Stack[1] === "aaa;bbb"
      && S.Stack[2] === "aaa bbb"
  });

});
