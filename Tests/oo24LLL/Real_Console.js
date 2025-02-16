import { LLL_STATE } from "../../Source/oo24LLL/TheMachine.js";
import { LLL_EXECUTE } from "../../Source/oo24LLL/Interpreter.js";
import { TransparentWritableStream } from "../_lib/TransparentWritableStream.js";
import * as libTest from "node:test";

libTest.test("hello world + metadata", () => {
    
  const TransparentStdOUT = new TransparentWritableStream();
  const S = new LLL_STATE();
  S.StdOUT = TransparentStdOUT.AsInjection();
  LLL_EXECUTE(`
GLOBAL_META Owner: dtkdtk0
GLOBAL_META Version v1.0.67

STRINGS_TABLE...

^START
Hello, World!\\n
^END

...END_TABLE

1 string print
  `, S);

  return S.Stack.length == 0
    && S.ScriptMetadata["Owner"] == "dtkdtk0"
    && S.ScriptMetadata["Version"] == "v1.0.67"

    && S.StringsTable.length == 1
    && S.StringsTable[0] == "Hello, World!\n"
    
    && TransparentStdOUT.Output == "Hello, World!";
});

