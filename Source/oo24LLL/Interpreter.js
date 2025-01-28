import { LLL_STATE, TheReaderStream, WordDefinitionFragment } from "./TheMachine.js";
import { RemoveSuffix } from "../Utils.js";
import * as aux from "./aAux.js";
import * as CoGr from "./CommonGrammar.js";



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
        if (Line == "END") {
          Content = HandleCharacterEscaping(S, Content);
          S.StringsTable.push(Content);
          continue interpreting;
        }
        if (Line == "\\END") {
          if (Content.length > 0)
            Content += "\n"
          Content += "END";
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
    const Tk = S.TheReader.GrabUnit();
    if (Tk.length > 1 && Tk.startsWith('"') && Tk.endsWith('"')) {
      const Handled = _Unquote(Tk);
      S.Stack.push(Handled); //не ищем определение
      continue interpreting;
    }
    const MaybeAsNumber = aux.MaybeAs_Number(S, Tk);
    if (MaybeAsNumber !== null) {
      S.Stack.push(MaybeAsNumber);
      continue interpreting;
    }
    findingDefinition: for (let i = S.Closures.length - 1; i >= 0; i--) {
      const TheClosure = S.Closures[i];
      const Definition = TheClosure.get(Tk);

      switch (typeof Definition) {
        case "undefined": //не нашли, ищем дальше
          continue findingDefinition;

        case "number": //это числовое значение => уверенно кидаем в стек
        case "string": //нашли строку / НЕленивое значение
          S.Stack.push(Definition);
          continue interpreting;

        case "function": //нашли, нативный JS
          Definition(S);
          continue interpreting;

        case "object":
          if (Definition instanceof WordDefinitionFragment) {
            S.TheReader.GotoDefinition(Definition);
            continue interpreting;
          }
          else continue;

        default:
          aux.ThrowRuntimeExc(S, `[internal] Unsupported JavaScript-runtime definition type: '${typeof Definition}'`);
      }
    }
    //не нашли определение ни в одном замыкании
    S.Stack.push(Tk);
  }
}



/**
 * Обрабатывает экранирвоание символов (а также спец.символы вроде '\n').
 * 
 * В данный момент поддерживаются следующие спец.символы:
 * - `\r` (возврат каретки; для совместимости с форматом конца строки "CRLF")
 * - `\n` (переход на новую строку)
 * - `\t` (символ табуляции)
 * - `\\` (обратный слеш)
 * - `\<перевод_строки>` (отменяет перевод строки)
 * @param {LLL_STATE} S 
 * @param {string} AllCode 
 * @returns {string} обработанная строка
 * @since `v0.0.3`
 */
function HandleCharacterEscaping(S, AllCode) {
  let NewCode = "";
  let PreviousIndex = 0;
  theLoop: while (true) {
    const MatchIndex = AllCode.indexOf("\\", PreviousIndex + 2);
    if (MatchIndex == -1) break;
    if (MatchIndex + 1 == AllCode.length)
      aux.ThrowRuntimeExc(S, `Expected escape character, got end of string`);
    NewCode += AllCode.slice(PreviousIndex, MatchIndex);
    PreviousIndex = MatchIndex;
    switch (AllCode[MatchIndex + 1]) {
      case "r":
        NewCode += "\r";
        continue theLoop;
      case "n":
        NewCode += "\n";
        continue theLoop;
      case "t":
        NewCode += "\t";
        continue theLoop;
      case "0":
        NewCode += "\0";
        continue theLoop;
      case "\\":
        NewCode += "\\";
        continue theLoop;
      case "\n":
        continue theLoop;
      case "\r":
        if (AllCode[MatchIndex + 2] == "\n")
        AllCode = AllCode.slice(MatchIndex + 3);
        continue theLoop;
      default:
        aux.ThrowRuntimeExc(S, `Non-existent special character: '\\${AllCode[MatchIndex + 1]}'`);
    }
  }
  NewCode += AllCode.slice(PreviousIndex, AllCode.length);
  return NewCode;
}



/**
 * Убирает кавычки с начала и с конца строки.
 * @param {string} Target 
 * @returns {string}
 */
function _Unquote(Target) {
  if (Target.length <= 2) return "";
  return Target.slice(1, Target.length - 1);
}
