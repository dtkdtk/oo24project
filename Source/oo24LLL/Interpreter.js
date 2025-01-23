import { LLL_STATE, TheReaderStream } from "./TheMachine.js";
import { RemoveSuffix } from "../Utils.js";
import * as aux from "./aAux.js";
import * as CoGr from "./CommonGrammar.js";



/**
 * @param {string} AllCode 
 */
export function LLL_EXECUTE(AllCode, S = new LLL_STATE()) {
  const Reader = new TheReaderStream(AllCode);
  InterpretPrelude(S, Reader);
  if (AllCode.length == 0) return;

  InterpretMainCode(S, Reader);
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
 * @param {TheReaderStream} Reader
 */
function InterpretPrelude(S, Reader) {
  S.CurrentInterpretingWord = "<prelude>";
  let ExplicitPreludeScope = false; //явное указание начала и конца Прелюдии?
  while (!Reader.IsCodeEnd) {
    const Instruction = Reader.PeekUnit();
    S.CurrentInterpretingLineIndex = Reader.LineIndex;
    switch (Instruction) {
      case CoGr.Prelude.META: {
        Reader.GrabUnit(); //Двигаем поток вперёд, ибо 'Instruction' не извлечена из потока
        let PropertyKey = Reader.GrabUnit();

        Reader.Options.HandleInlineComments = false;
        Reader.Options.HandleCommentLines = false;
        Reader.Options.UnitBound = "\n";
        let PropertyValue = Reader.GrabUnit();
        Reader.Options.HandleInlineComments = true;
        Reader.Options.HandleCommentLines = true;
        Reader.Options.UnitBound = " ";

        PropertyKey = RemoveSuffix(PropertyKey, ":");
        S.ScriptMetadata[PropertyKey] = ParseValue(S, PropertyValue);
        break;
      }
      case CoGr.Prelude.STRTABLE_START: {
        Reader.GrabUnit(); //Двигаем поток вперёд, ибо 'Instruction' не извлечена из потока
        InterpretStringsTable(S, Reader);
        break;
      }
      case CoGr.Prelude.EXPLICIT_START_PRELUDE:
        Reader.GrabUnit(); //Двигаем поток вперёд, ибо 'Instruction' не извлечена из потока
        ExplicitPreludeScope = true;
        break;
      case CoGr.Prelude.EXPLICIT_END_PRELUDE:
        Reader.GrabUnit(); //Двигаем поток вперёд, ибо 'Instruction' не извлечена из потока
        if (!ExplicitPreludeScope)
          return aux.ThrowRuntimeExc_Here(S, `If there is an explicit end of the Prelude, there must also be an explicit beginning.`);
        return;
      default: //не спец.инструкция Прелюдии => мы вышли из неё
        if (ExplicitPreludeScope)
          return aux.ThrowRuntimeExc_Here(S, `Expected an explicit end of the Prelude (because the beginning is explicitly specified).`);
        return;
    }
  }
}



/**
 * Отдельный интерпретатор для *таблицы строк*.
 * @param {LLL_STATE} S
 * @param {TheReaderStream} Reader
 */
function InterpretStringsTable(S, Reader) {
  S.CurrentInterpretingWord = "<prelude/StringsTable>";
  Reader.Options.UnitBound = "\n";
  Reader.Options.SkipEmptyUnits = false;
  interpreting: while (!Reader.IsCodeEnd) {
    let Line = Reader.GrabUnit();
    S.CurrentInterpretingLineIndex = Reader.LineIndex;
    let Content = "";

    if (Line == CoGr.Prelude.STRTABLE_ELEMENT_START) {
      Reader.Options.HandleInlineComments = false;
      Reader.Options.HandleCommentLines = false;
      readingString: while (!Reader.IsCodeEnd) {
        const Line = Reader.GrabUnit();
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
      return aux.ThrowRuntimeExc_Here(S, `Expected '${CoGr.Prelude.STRTABLE_ELEMENT_END}' at end of string.`);
    }
    else if (Line == CoGr.Prelude.STRTABLE_END) {
      Reader.Options.HandleCommentLines = true;
      Reader.Options.HandleInlineComments = true;
      Reader.Options.DrainOnNewline = true;
      Reader.Options.UnitBound = " ";
      Reader.Options.SkipEmptyUnits = true;
      return;
    }
    else
      return aux.ThrowRuntimeExc_Here(S, `Failed to process this line from string table block: '${Line}'`);
  }
  return aux.ThrowRuntimeExc_Here(S, `Expected '${CoGr.Prelude.STRTABLE_END}' at end of string table block.`);
}



/**
 * Интерпретатор **И ИСПОЛНИТЕЛЬ** основной части кода.
 * @param {LLL_STATE} S 
 * @param {TheReaderStream} Reader 
 */
function InterpretMainCode(S, Reader) {
  interpreting: while (!Reader.IsCodeEnd) {
    const Tk = Reader.GrabUnit();
    S.CurrentInterpretingWord = Tk;
    S.CurrentInterpretingLineIndex = Reader.LineIndex;
    const MaybeAsNumber = aux.MaybeReprAs_Number(S, Tk);
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
          Definition(S, Reader);
          continue interpreting;

        default:
          aux.ThrowRuntimeExc_Here(S, `[internal] Unsupported JavaScript-runtime datatype: '${typeof Tk}'`);
      }
    }
    //не нашли определение ни в одном замыкании
    return aux.ThrowRuntimeExc_Here(S, `Undefined word: '${Tk}'`);
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
      return aux.ThrowRuntimeExc_Here(S, `Expected escape character, got end of string`);
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
        return aux.ThrowRuntimeExc_Here(S, `Non-existent special character: '\\${AllCode[MatchIndex + 1]}'`);
    }
  }
  NewCode += AllCode.slice(PreviousIndex, AllCode.length);
  return NewCode;
}



/**
 * Парсит значение и конвертирует его в runtime-тип данных.
 * @param {LLL_STATE} S
 * @param {string} Value 
 * @returns {llval_ty}
 */
function ParseValue(S, Value) {
  const AsNumber = Number(Value);
  if (!isNaN(AsNumber))
    return aux.RtvalueOf_Number(S, AsNumber);
  else //однозначно строка; других значений у нас пока нет
    return aux.RtvalueOf_String(S, Value);
}
