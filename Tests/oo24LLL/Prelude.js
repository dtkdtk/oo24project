import { LLL_STATE } from "../../Source/oo24LLL/TheMachine.js";
import { LLL_EXECUTE } from "../../Source/oo24LLL/Interpreter.js";
import { GetStateTrace } from "../../Source/oo24LLL/AuxStateTrace.js";
import { TransparentWritableStream } from "../_lib/TransparentWritableStream.js";
import * as libTest from "node:test";

libTest.describe("Prelude testing", () => {

  libTest.it("hello world + metadata", () => {
    
    const TransparentStdOUT = new TransparentWritableStream();
    const S = new LLL_STATE();
    S.StdOUT = TransparentStdOUT.Stream;
    LLL_EXECUTE(`
META Owner: dtkdtk0
META Version v1.0.67

STRINGS-TABLE:

STRING
Hello, World!
END

END-TABLE

0 string print
    `, S);

    return S.Stack.length == 0
      && S.ScriptMetadata["Owner"] == "dtkdtk0"
      && S.ScriptMetadata["Version"] == "v1.0.67"

      && S.StringsTable.length == 1
      && S.StringsTable[0] == "Hello, World!"
      
      && TransparentStdOUT.Output == "Hello, World!";
  });

});

