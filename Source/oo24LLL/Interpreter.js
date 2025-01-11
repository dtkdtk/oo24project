import { LLL_STATE, TheReaderStream } from "./TheMachine.js";
import { RemoveSuffix } from "../Utils.js";
import * as aux from "./aAux.js";



/* TYPES: */
/**
 * @typedef {"IgnoreWord"} _KnownPragmaKeys
 */

/**
 * @param {string} AllCode 
 */
export function LLL_EXECUTE(AllCode, S = new LLL_STATE()) {
  const Reader = new TheReaderStream(AllCode);
  InterpretPrelude(S, Reader);
  if (AllCode.length == 0) return;

  RecursiveInterpret(S, Reader);
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
  let Instruction;
  while (Instruction = Reader.GrabUnit(), !Reader.IsCodeEnd) {
    switch (Instruction) {
      case "META": {
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
      case "STRINGS-TABLE:": {
        return InterpretStringsTable(S, Reader);
      }
      default:
        Reader.RevertGrabbing();
        return; //значит, мы уже вышли из прелюдии
    }
  }
}



/**
 * Отдельный интерпретатор для *таблицы строк*.
 * @param {LLL_STATE} S
 * @param {TheReaderStream} Reader
 */
function InterpretStringsTable(S, Reader) {
  Reader.Options.SkipEmptyUnits = false;
  Reader.Options.HandleInlineComments = false;
  Reader.Options.HandleCommentLines = false;
  Reader.Options.UnitBound = "\n";
  let Line;
  interpreting: while (Line = Reader.GrabUnit(), !Reader.IsCodeEnd) {
    let Content = "";

    if (Line == "STRING") {
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
      return aux.ThrowRuntimeExc_Here(S, `Expected "END" at end of string.`);
    }
    else if (Line == "END-TABLE") {
      Reader.Options.HandleCommentLines = true;
      Reader.Options.HandleInlineComments = true;
      Reader.Options.DrainOnNewline = true;
      Reader.Options.UnitBound = " ";
      Reader.Options.SkipEmptyUnits = true;
      return;
    }
    else
      return aux.ThrowRuntimeExc_Here(S, `Failed to process line from string table block:`);
  }
  return aux.ThrowRuntimeExc_Here(S, `Expected "END-TABLE" at end of string table block.`);
}



/**
 * Рекурсивный интерпретатор **И ИСПОЛНИТЕЛЬ** основной части кода.
 * @param {LLL_STATE} S 
 * @param {TheReaderStream} Reader 
 */
function RecursiveInterpret(S, Reader) {
  let Tk;
  interpreting: while (Tk = Reader.GrabUnit(), !Reader.IsCodeEnd) {
    S.CurrentInterpretingWord = Tk;
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

        /*case "object": //отложенное вычисление?..
          if (Definition instanceof TheReaderStream) {
            RecursiveInterpret(S, Definition);
          }
          else continue findingDefinition;*/
        default:
          aux.ThrowRuntimeExc_Here(S, `Unsupported JavaScript-runtime datatype: '${typeof Tk}'`);
      }
    }
    S.Stack.push(ParseValue(S, Tk)); //не нашли ни в одном замыкании => кидаем в стек "как есть"
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
