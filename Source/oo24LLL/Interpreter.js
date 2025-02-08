import { LLL_STATE, TheReader, CodeFragment } from "./TheMachine.js";
import * as aux from "./aAux.js";
import * as CoGr from "./CommonGrammar.js";
import * as libUtilsTy from "../Utils-typed.js";



/**
 * @param {string} AllCode 
 */
export function LLL_EXECUTE(AllCode, S = new LLL_STATE()) {
  if (AllCode.length == 0) return;
  const Reader = new TheReader(AllCode);
  S.TheReader = Reader;

  InterpretPrelude(S);
  if (S.TheReader.IsCodeEnd) return;

  InterpretMainCode(S);
  if (S.Stack.length > 0) {
    aux.EmitWarning(S, "W_1001", S);
  }
}



/**
 * Отдельный интерпретатор для *Прелюдии*.
 * В Прелюдии допускаются:
 * - комментарии
 * - метаинформация
 * - ~~прагмы~~
 * - ~~импорты?!~~
 * 
 * Таблица строк интерпретируется **внутри** Прелюдии.
 * @param {LLL_STATE} S 
 */
function InterpretPrelude(S) {
  S.AdditionalLocationInfo = "<prelude>";
  let ExplicitPreludeScope = false; //явное указание начала и конца Прелюдии?
  interpreting: while (true) {
    const Instruction = S.TheReader.GrabUnit();
    if (S.TheReader.IsCodeEnd) return;
    switch (Instruction) {
      case CoGr.Prelude.META: {
        let PropertyKey = S.TheReader.GrabUnit();
        if (S.TheReader.IsCodeEnd)
          aux.ThrowSyntaxError(S, "ESX_p103");

        S.TheReader.Options.HandleInlineComments = false;
        S.TheReader.Options.HandleCommentLines = false;
        S.TheReader.Options.UnitBound = "\n";
        let PropertyValue = S.TheReader.GrabUnit();
        if (S.TheReader.IsCodeEnd)
          aux.ThrowSyntaxError(S, "ESX_p104");
        S.TheReader.Options.HandleInlineComments = true;
        S.TheReader.Options.HandleCommentLines = true;
        S.TheReader.Options.UnitBound = " ";

        S.ScriptMetadata[PropertyKey] = PropertyValue;
        break;
      }
      case CoGr.Prelude.STRTABLE_START: {
        InterpretStringsTable(S);
        break;
      }
      case CoGr.Prelude.EXPLICIT_START_PRELUDE:
        ExplicitPreludeScope = true;
        break;
      case CoGr.Prelude.EXPLICIT_END_PRELUDE:
        if (!ExplicitPreludeScope)
          aux.ThrowSyntaxError(S, "ESX_p101");
        break interpreting;
      default: //не спец.инструкция Прелюдии => мы вышли из неё
        if (ExplicitPreludeScope)
          aux.ThrowSyntaxError(S, "ESX_p102");
        S.TheReader.JumpBack();
        break interpreting;
    }
  }
}



/**
 * Отдельный интерпретатор для *таблицы строк*.
 * @param {LLL_STATE} S
 */
function InterpretStringsTable(S) {
  S.AdditionalLocationInfo = "<prelude/StringsTable>";
  S.TheReader.Options.UnitBound = "\n";
  S.TheReader.Options.SkipEmptyUnits = false;
  interpreting: while (true) {
    let Line = S.TheReader.GrabUnit();
    if (S.TheReader.IsCodeEnd) break interpreting;
    let Content = "";

    if (Line == CoGr.Prelude.STRTABLE_ELEMENT_START) {
      S.TheReader.Options.HandleInlineComments = false;
      S.TheReader.Options.HandleCommentLines = false;
      readingString: while (true) {
        const Line = S.TheReader.GrabUnit();
        if (S.TheReader.IsCodeEnd) break readingString;
        if (Line == CoGr.Prelude.STRTABLE_ELEMENT_END) {
          Content = aux.HandleCharacterEscaping(S, Content);
          S.StringsTable.push(Content);
          continue interpreting;
        }
        if (Line == "\\" + CoGr.Prelude.STRTABLE_ELEMENT_END) {
          if (Content.length > 0)
            Content += "\n"
          Content += CoGr.Prelude.STRTABLE_ELEMENT_END;
          continue readingString;
        }
        if (Content.length > 0)
          Content += "\n"
        Content += Line;
      }
      aux.ThrowRuntimeException(S, "ESX_p105");
    }
    else if (Line == CoGr.Prelude.STRTABLE_END) {
      S.TheReader.Options.HandleCommentLines = true;
      S.TheReader.Options.HandleInlineComments = true;
      S.TheReader.Options.DrainOnNewline = true;
      S.TheReader.Options.UnitBound = " ";
      S.TheReader.Options.SkipEmptyUnits = true;
      return;
    }
    else
      aux.ThrowRuntimeException(S, "ESX_p106", Line);
  }
  aux.ThrowRuntimeException(S, "ESX_p107");
}



/**
 * Интерпретирует отдельное слово - не важно, откуда оно было получено.
 * @param {LLL_STATE} S 
 * @param {string} Word 
 * @returns {void}
 */
function InterpretWord(S, Word) {
  if (Word.length > 1 && Word.startsWith('"') && Word.endsWith('"')) {
    const Handled = aux.Unquote_(Word);
    S.Stack.push(Handled); //не ищем определение
    return;
  }
  const MaybeAsNumber = aux.MaybeAs_Number(S, Word);
  if (MaybeAsNumber !== null) {
    S.Stack.push(MaybeAsNumber);
    return;
  }
  
  const Definition = _SearchForDefinition(S, Word);

  if (Word.endsWith("...")) {
    const CodeFragment = ParseCodeblock(S, null);
    S.StateStorage.PostBlock = CodeFragment;
    if (typeof Definition == "function")
      Definition(S);
    else
      aux.ThrowRuntimeException(S, "ERT_1003", Word, typeof Definition);
    S.StateStorage.PostBlock = null;
    return;
  }

  switch (typeof Definition) {
    case "undefined": //не нашли, ищем дальше
      //не нашли определение ни в одном "замыкании"
      aux.ThrowRuntimeException(S, "ERT_1001", Word);

    case "number": //это числовое значение => уверенно кидаем в стек
    case "string": //нашли строку / НЕленивое значение
      S.Stack.push(Definition);
      return;

    case "function": //нашли, нативный JS
      Definition(S);
      return;

    case "object": {
      if (Definition instanceof CodeFragment) {
        RecursivelyInterpretCodeblock(S, Definition);
        return;
      }
      aux.ThrowRuntimeException(S, "XRT_i102", Object.getPrototypeOf(Definition));
    }

    default:
      aux.ThrowRuntimeException(S, "XRT_i101", typeof Definition);
  }
}



/**
 * Интерпретатор **И ИСПОЛНИТЕЛЬ** основной части кода.
 * @param {LLL_STATE} S 
 */
function InterpretMainCode(S) {
  S.AdditionalLocationInfo = null;
  while (true) {
    const Word = S.TheReader.GrabUnit();
    if (S.TheReader.IsCodeEnd) break;
    InterpretWord(S, Word);
  }
}



const _AllComplexConstructions = Object.values(CoGr.Constrct);

/**
 * @param {LLL_STATE} S 
 * @param {string | null} Label 
 * @returns {CodeFragment}
 */
function ParseCodeblock(S, Label) {
  S.AdditionalLocationInfo = Label;
  Label = _MakeLabel(S, Label);
  S.PseudoScope.push(Label);
  const Definition = new CodeFragment([], Label);
  let Depth = 0;
  while (true) {
    const Word = S.TheReader.GrabUnit();
    if (Word == CoGr.INSTR_END_OF_BLOCK) {
      if (Depth == 0) break;
      Depth--;
    }
    if (S.TheReader.IsCodeEnd)
      aux.ThrowRuntimeException(S, "ESX_1001");
    
    if (_AllComplexConstructions.includes(Word)) {
      Depth++;
      let MaybeInnerLabel = libUtilsTy.__Any;
      if (Word == CoGr.Constrct.DEFINE_FUNC) //или любая другая именованная конструкция
        MaybeInnerLabel = Definition.Words.pop();
      const InnerDefinition = ParseCodeblock(S, _MakeLabel(S, MaybeInnerLabel));
      Definition.Words.push(...InnerDefinition.Words);
    }
    else
      Definition.Words.push(Word);
  }

  S.AdditionalLocationInfo = null;
  S.PseudoScope.pop();
  return Definition;
}



/**
 * 
 * @param {LLL_STATE} S 
 * @param {CodeFragment} Block 
 */
function RecursivelyInterpretCodeblock(S, Block) {
  S.PseudoScope.push(Block.Label);
  for (const W of Block.Words)
    if (typeof W == "string")
      InterpretWord(S, W);
    else
      RecursivelyInterpretCodeblock(S, W);
  S.PseudoScope.pop();
}



/**
 * @param {LLL_STATE} S 
 * @param {string | null | undefined} MaybeLabel 
 * @returns {string}
 */
function _MakeLabel(S, MaybeLabel) {
  return MaybeLabel
    ?? CoGr.MakeIntrinsic("AnonymScope:" + S.StateStorage._CurrentSymbolIndex++);
}



/**
 * Ищет определение слова в пользовательском и изначальном словарях.
 * Учитывает области видимости.
 * @param {LLL_STATE} S 
 * @param {string} Word
 * @returns {LLL_Definition | undefined}
 */
function _SearchForDefinition(S, Word) {
  //TODO: Оптимизировать. Можно сделать сначала полную строку, а потом "снимать слои" с неё.
  const MaybePrimordialDefinition = S.PrimordialDict.get(Word);
  if (MaybePrimordialDefinition) return MaybePrimordialDefinition;
  const CurrentScope = [...S.PseudoScope];
  while (CurrentScope.length > 0) {
    const FullScope = CurrentScope.join(CoGr.TK_SCOPE_SEPARATOR);
    const FullWord = FullScope + CoGr.TK_SCOPE_SEPARATOR + Word;
    const MaybeDefinition = S.UserDict.get(FullWord);
    if (MaybeDefinition !== undefined) return MaybeDefinition;
    CurrentScope.pop();
  }
  return S.UserDict.get(Word);
}
