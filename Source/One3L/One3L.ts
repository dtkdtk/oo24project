const VERSION = "0.1";
const BUILD = 1;

function EXECUTE(AllCode: string): StateExemplar | undefined {
  if (AllCode.length == 0) return;
  const S = new StateExemplar(AllCode);
  const WordGenerator = S.MakeWordsGenerator();
  LoadStdDefinitions(S);
  for (const Word of WordGenerator) {
    InterpretWord(Word, S);
  }
  return S;
}

function InterpretWord(Word: string, S: StateExemplar) {
  if (Word == "[[") {
    S.CurrentDepth++;
    if (S.CurrentDefinition)
      S.CurrentDefinition.push(Word);
    else
      S.CurrentDefinition = new DefinitionExemplar();
    return;
  }
  if (Word == "]]") {
    S.CurrentDepth--;
    if (S.CurrentDepth == 0) {
      S.Stack.push(S.CurrentDefinition);
      S.CurrentDefinition = null;
    }
    else if (S.CurrentDefinition)
      S.CurrentDefinition.push(Word);
    return;
  }

  if (S.CurrentDefinition) {
    S.CurrentDefinition.push(Word);
    return;
  }
  
  switch (Word) {
    case "DEFINE": {
      const VarName = S.Stack.pop()! as string;
      const VarValue = S.Stack.pop()!;
      S.Dict.set(VarName, VarValue);
      return;
    }
    case "CONDITION": {
      const BlockElse = S.Stack.pop()! as DefinitionExemplar;
      const BlockThen = S.Stack.pop()! as DefinitionExemplar;
      const Condtition = S.Stack.pop()! as number;
      for (const W of Condtition ? BlockThen : BlockElse)
        InterpretWord(W, S);
      return;
    }
    case "LOOP": {
      const Block = S.Stack.pop()! as DefinitionExemplar;
      const LoopState = new LoopData(Block);
      S.LoopsStack.push(LoopState);
      LoopEngine(S);
      return;
    }
    case "BREAK_LOOP": {
      S.LoopsStack[S.LoopsStack.length - 1].IsBreaked = true;
      return;
    }
    case "SKIP_ITERATION": {
      S.LoopsStack[S.LoopsStack.length - 1].IsSkipped = true;
      return;
    }
  }
  
  const MaybeAsNumber = Number(Word);
  if (!isNaN(MaybeAsNumber)) {
    S.Stack.push(MaybeAsNumber);
    return;
  }

  if (Word.startsWith('`') && Word.endsWith('`')) {
    const WordUnquoted = Unquote(Word);
    S.Stack.push(WordUnquoted);
    return;
  }

  const MaybeDefinition = S.Dict.get(Word);
  if (MaybeDefinition === undefined)
    S.Stack.push(Word);
  else if (typeof MaybeDefinition == "function")
    MaybeDefinition(S);
  else if (MaybeDefinition instanceof DefinitionExemplar)
    for (const W of MaybeDefinition)
      InterpretWord(W, S);
  else
    S.Stack.push(MaybeDefinition);
}

function LoopEngine(S: StateExemplar) {
  const LoopState = S.LoopsStack[S.LoopsStack.length - 1];
  let LoopAvailable = true;
  while (LoopAvailable) {
    for (let i = 0; i < LoopState.Definition.length; i++) {
      const W = LoopState.Definition[i];
      if (LoopState.IsBreaked) {
        S.LoopsStack.pop();
        LoopAvailable = false;
        break;
      }
      if (LoopState.IsSkipped) {
        LoopState.IsSkipped = false;
        i = -1;
        break;
      }
      InterpretWord(W, S);
    }
  }
}



type RuntimeValue = string | DefinitionExemplar | number | null;
type NativeDefinition = (S: StateExemplar) => void;
type AnyWordDefinition = RuntimeValue | DefinitionExemplar | NativeDefinition;

class StateExemplar {
  Stack: RuntimeValue[] = [];
  Dict: Map<string, AnyWordDefinition> = new Map();
  LoopsStack: LoopData[] = [];
  CurrentDefinition: DefinitionExemplar | null = null;
  CurrentDepth = 0;
  ReaderPos = 0;
  WordIndex = 0;
  readonly AllCode: string;
  constructor(AllCode: string) {
    this.AllCode = AllCode;
  }
  * MakeWordsGenerator() {
    let Buf = "";
    let iComment = false;
    while (this.ReaderPos <= this.AllCode.length) {
      const Tk = this.AllCode[this.ReaderPos++];
      if (Tk == ")" && iComment) {
        iComment = false;
        continue;
      }
      if (iComment) continue;
      if (Tk == "(") {
        iComment = true;
        if (Buf.length > 0) {
          this.WordIndex++;
          yield Buf;
          Buf = "";
        }
        continue;
      }
      if (Tk == " " || Tk == "\r" || Tk == "\n") {
        if (Buf.length > 0) {
          this.WordIndex++;
          yield Buf;
          Buf = "";
        }
        continue;
      }
      Buf += Tk;
    }
    return Buf;
  }
}

class DefinitionExemplar extends Array<string> {
  [Symbol.toStringTag] = () => "DefinitionExemplar";
}
class LoopData {
  IsSkipped = false;
  IsBreaked = false;
  Definition: DefinitionExemplar;
  [Symbol.toStringTag] = () => "LoopData";

  constructor(Definition: DefinitionExemplar) {
    this.Definition = Definition;
  }
}

function Unquote(Target: string): string {
  if (Target.length <= 2) return "";
  return Target.slice(1, Target.length - 1);
}



function LoadStdDefinitions(TheState: StateExemplar) {
  TheState.Dict.set("null", (S) => {
    S.Stack.push(null);
  });
  TheState.Dict.set("true", (S) => {
    S.Stack.push(0x1);
  });
  TheState.Dict.set("false", (S) => {
    S.Stack.push(0x0);
  });
  TheState.Dict.set("Current_Interpreter_Version", (S) => {
    S.Stack.push(VERSION);
  });
  TheState.Dict.set("Current_Interpreter_Build", (S) => {
    S.Stack.push(BUILD);
  });
  TheState.Dict.set("Current_Interpreter_Name", (S) => {
    S.Stack.push("One3L.js");
  });

  TheState.Dict.set("dup", (S) => {
    const Value = S.Stack.at(-1)!
    S.Stack.push(Value);
  });
  TheState.Dict.set("dupsub", (S) => {
    const Value = S.Stack.at(-2)!
    S.Stack.push(Value);
  });
  TheState.Dict.set("dupat", (S) => {
    const Pos = S.Stack.pop()! as number;
    const Value = S.Stack.at(Pos)!;
    S.Stack.push(Value);
  });
  TheState.Dict.set("drop", (S) => {
    S.Stack.pop();
  });
  TheState.Dict.set("print", (S) => {
    const Value = S.Stack.pop();
    console.log(Value);
  });
  TheState.Dict.set("concat", (S) => {
    const B = String(S.Stack.pop()!);
    const A = S.Stack.pop()!;
    S.Stack.push(A + B);
  });
  TheState.Dict.set("exit_program", (S) => {
    const ExitCode = S.Stack.pop()! as number | null;
    if (ExitCode !== null
        && typeof global.process != "undefined"
        && typeof process.exit == "function"
    ) {
      process.exit(ExitCode);
    }
    else {
      S.ReaderPos = S.AllCode.length;
    }
  });

  TheState.Dict.set("[+]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A + B);
  });
  TheState.Dict.set("[-]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A - B);
  });
  TheState.Dict.set("[*]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A * B);
  });
  TheState.Dict.set("[/]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A / B);
  });
  TheState.Dict.set("[//]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(Math.floor(A / B));
  });
  TheState.Dict.set("[%]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A % B);
  });
  TheState.Dict.set("increment", (S) => {
    const X = S.Stack.pop()! as number;
    S.Stack.push(X + 1);
  });
  TheState.Dict.set("decrement", (S) => {
    const X = S.Stack.pop()! as number;
    S.Stack.push(X - 1);
  });

  TheState.Dict.set("[==]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A == B ? 0x1 : 0x0);
  });
  TheState.Dict.set("[!=]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A != B ? 0x1 : 0x0);
  });
  TheState.Dict.set("[>]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A > B ? 0x1 : 0x0);
  });
  TheState.Dict.set("[>=]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A >= B ? 0x1 : 0x0);
  });
  TheState.Dict.set("[<]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A < B ? 0x1 : 0x0);
  });
  TheState.Dict.set("[<=]", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A <= B ? 0x1 : 0x0);
  });
  TheState.Dict.set("not", (S) => {
    const X = S.Stack.pop()!;
    S.Stack.push(X == 0x1 ? 0x0 : 0x1);
  });
  TheState.Dict.set("bitnot", (S) => {
    const X = S.Stack.pop()!;
    S.Stack.push(~ X);
  });
  TheState.Dict.set("and", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A & B);
  });
  TheState.Dict.set("or", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A | B);
  });
  TheState.Dict.set("bitxor", (S) => {
    const B = S.Stack.pop()! as number;
    const A = S.Stack.pop()! as number;
    S.Stack.push(A ^ B);
  });
  TheState.Dict.set("[<<]", (S) => {
    const Shift = S.Stack.pop()! as number;
    const X = S.Stack.pop()! as number;
    S.Stack.push(X << Shift);
  });
  TheState.Dict.set("[>>]", (S) => {
    const Shift = S.Stack.pop()! as number;
    const X = S.Stack.pop()! as number;
    S.Stack.push(X >> Shift);
  });
  TheState.Dict.set("[>>>]", (S) => {
    const Shift = S.Stack.pop()! as number;
    const X = S.Stack.pop()! as number;
    S.Stack.push(X >>> Shift);
  });
}

Object.defineProperty(global, "One3L_EXECUTE", { value: EXECUTE });
Object.defineProperty(global, "One3L_STATE", { value: StateExemplar });
