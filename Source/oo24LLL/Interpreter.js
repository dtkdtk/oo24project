import { LLL_STATE, TheReaderStream, WordDefinitionFragment } from "./TheMachine.js";
import { RemoveSuffix } from "../Utils.js";
import * as aux from "./aAux.js";
import * as CoGr from "./CommonGrammar.js";
import * as libUtilsTy from "../Utils-typed.js";



/**
 * @param {string} AllCode 
 */
export function LLL_EXECUTE(AllCode, S = new LLL_STATE()) {
  const Reader = new TheReaderStream(AllCode);
  S.TheReader = Reader;
  InterpretPrelude(S);
  if (AllCode.length == 0) return;

  InterpretMainCode(S);
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
  while (!S.TheReader.IsCodeEnd) {
    const Instruction = S.TheReader.PeekUnit();
    switch (Instruction) {
      case CoGr.Prelude.META: {
        S.TheReader.GrabUnit(); //Двигаем поток вперёд, ибо 'Instruction' не извлечена из потока
        let PropertyKey = S.TheReader.GrabUnit();

        S.TheReader.Options.HandleInlineComments = false;
        S.TheReader.Options.HandleCommentLines = false;
        S.TheReader.Options.UnitBound = "\n";
        let PropertyValue = S.TheReader.GrabUnit();
        S.TheReader.Options.HandleInlineComments = true;
        S.TheReader.Options.HandleCommentLines = true;
        S.TheReader.Options.UnitBound = " ";

        PropertyKey = RemoveSuffix(PropertyKey, ":");
        S.ScriptMetadata[PropertyKey] = aux.MaybeAs_Number(S, PropertyValue) ?? PropertyValue;
        break;
      }
      case CoGr.Prelude.STRTABLE_START: {
        S.TheReader.GrabUnit(); //Двигаем поток вперёд, ибо 'Instruction' не извлечена из потока
        InterpretStringsTable(S);
        break;
      }
      case CoGr.Prelude.EXPLICIT_START_PRELUDE:
        S.TheReader.GrabUnit(); //Двигаем поток вперёд, ибо 'Instruction' не извлечена из потока
        ExplicitPreludeScope = true;
        break;
      case CoGr.Prelude.EXPLICIT_END_PRELUDE:
        S.TheReader.GrabUnit(); //Двигаем поток вперёд, ибо 'Instruction' не извлечена из потока
        if (!ExplicitPreludeScope)
          aux.ThrowRuntimeExc(S, `If there is an explicit end of the Prelude, there must also be an explicit beginning.`);
        return;
      default: //не спец.инструкция Прелюдии => мы вышли из неё
        if (ExplicitPreludeScope)
          aux.ThrowRuntimeExc(S, `Expected an explicit end of the Prelude (because the beginning is explicitly specified).`);
        return;
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
  interpreting: while (!S.TheReader.IsCodeEnd) {
    let Line = S.TheReader.GrabUnit();
    let Content = "";

    if (Line == CoGr.Prelude.STRTABLE_ELEMENT_START) {
      S.TheReader.Options.HandleInlineComments = false;
      S.TheReader.Options.HandleCommentLines = false;
      readingString: while (!S.TheReader.IsCodeEnd) {
        const Line = S.TheReader.GrabUnit();
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
      aux.ThrowRuntimeExc(S, `Expected '${CoGr.Prelude.STRTABLE_ELEMENT_END}' at end of string.`);
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
      aux.ThrowRuntimeExc(S, `Failed to process this line from string table block: '${Line}'`);
  }
  aux.ThrowRuntimeExc(S, `Expected '${CoGr.Prelude.STRTABLE_END}' at end of string table block.`);
}



/**
 * Интерпретатор **И ИСПОЛНИТЕЛЬ** основной части кода.
 * @param {LLL_STATE} S 
 */
function InterpretMainCode(S) {
  S.AdditionalLocationInfo = null;
  interpreting: while (!S.TheReader.IsCodeEnd) {
    const Word = S.TheReader.GrabUnit();
    if (Word.length > 1 && Word.startsWith('"') && Word.endsWith('"')) {
      const Handled = aux.Unquote_(Word);
      S.Stack.push(Handled); //не ищем определение
      continue interpreting;
    }
    const MaybeAsNumber = aux.MaybeAs_Number(S, Word);
    if (MaybeAsNumber !== null) {
      S.Stack.push(MaybeAsNumber);
      continue interpreting;
    }
    
    const Definition = _SearchForDefinition(S, Word);

    switch (typeof Definition) {
      case "undefined": //не нашли, ищем дальше
        //не нашли определение ни в одном "замыкании"
        aux.ThrowRuntimeExc(S, `Undefined word: '${Word}'`);

      case "number": //это числовое значение => уверенно кидаем в стек
      case "string": //нашли строку / НЕленивое значение
        S.Stack.push(Definition);
        continue interpreting;

      case "function": //нашли, нативный JS
        Definition(S);
        continue interpreting;

      case "object":
        if (Definition instanceof WordDefinitionFragment) {
          S.VirtualScope.push(Word);
          S.TheReader.GotoDefinition(Definition);
          S.VirtualScope.pop();
          continue interpreting;
        }
        else continue;

      default:
        aux.ThrowRuntimeExc(S, `[internal] Unsupported JavaScript-runtime definition type: '${typeof Definition}'`);
    }
  }
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
  const CurrentScope = [...S.VirtualScope];
  while (CurrentScope.length > 0) {
    const FullScope = CurrentScope.join(CoGr.TK_SCOPE_SEPARATOR);
    const FullWord = FullScope + CoGr.TK_SCOPE_SEPARATOR + Word;
    const MaybeDefinition = S.UserDict.get(FullWord);
    if (MaybeDefinition !== undefined) return MaybeDefinition;
    CurrentScope.pop();
  }
  return S.UserDict.get(Word);
}
