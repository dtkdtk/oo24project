import { LLL_STATE, _WordStream, _PrepareCodeLine } from "./TheMachine.js";
import { RemoveSuffix } from "../Utils.js";



/* TYPES: */
/**
 * @typedef {"IgnoreWord"} _KnownPragmaKeys
 */

/**
 * @param {string} AllCode 
 */
export function LLL_EXECUTE(AllCode, S = new LLL_STATE()) {
  AllCode = InterpretPrelude(AllCode, S);
  if (AllCode.length == 0) return;

  const TheStream = new _WordStream(AllCode);
  RecursiveInterpret(S, TheStream);
}



/**
 * Отдельный интерпретатор для *Прелюдии*.
 * В Прелюдии допускаются:
 * - комментарии
 * - метаинформация
 * - ~~прагмы~~
 * - ~~импорты?!~~
 * Таблица строк интерпретируется **внутри** Прелюдии.
 * @param {string} AllCode 
 * @param {LLL_STATE} S 
 * @returns {string} изменённый код
 */
function InterpretPrelude(AllCode, S) {
  while (AllCode.length > 0) {
    let [Line, ...OtherLines] = AllCode.split("\n");
    AllCode = OtherLines.join("\n");
    Line = _PrepareCodeLine(Line);
    if (Line.length == 0) continue;
    
    const ParsedLine = Line.split(" ");
    switch (ParsedLine[0]) {
      case "META": {
        S.aux.Assert_At("<prelude>", ParsedLine.length > 2, "Incorrect use of 'META' directive. Expected a field key and value.");
        let [Key, Value] = ParsedLine.slice(1);
        Key = RemoveSuffix(Key, ":");
        S.ScriptMetadata[Key] = ParseValue(S, Value);
        break;
      }
      case "STRINGS-TABLE:": {
        const NewCode = AllCode.split("\n").slice(1).join("\n");
        return InterpretStringsTable(NewCode, S);
      }
      default:
        return Line + "\n" + AllCode; //значит, мы уже вышли из прелюдии
    }
  }
  throw new Error("Impossible error");
}



/**
 * Отдельный интерпретатор для *таблицы строк*.
 * @param {string} AllCode 
 * @param {LLL_STATE} S 
 * @returns {string} изменённый код
 */
function InterpretStringsTable(AllCode, S) {
  //ВНИМАНИЕ! Символ '\n' пока не работает.
  //Думаю, подстановку (с учётом терминации) реального перевода строки
  // вместо этого символа стоит ввести в 'ParseValue()'

  while (AllCode.length > 0) {
    let [Line, ...OtherLines] = AllCode.split("\n\n");
    AllCode = OtherLines.join("\n\n");
    
    const [TheInstruction] = Line.split(" ", 1);
    if (TheInstruction == "STRING") {
      const TheString = Line.split(" ").slice(1).join(" ");
      S.StringsTable.push(TheString);
    }
    else if (TheInstruction.startsWith("END"))
      return AllCode;
    else
      throw new LLL_InterpreterError("Нарушение формата таблицы строк: Двойные переводы строк имеют специальное значение (служат разделителем для строк в таблице).\n\tЕсли хотите вставить двойной перевод строки - используйте строку с '\\n'.");
  }
  throw new LLL_InterpreterError(`Незавершённый блок таблицы строк`);
}



/**
 * Рекурсивный интерпретатор **И ИСПОЛНИТЕЛЬ** основной части кода.
 * @param {LLL_STATE} S 
 * @param {_WordStream} ws 
 */
function RecursiveInterpret(S, ws) {
  interpreting: while (ws.tkRefillLineBuff()) {
    const Tk = ws.tkGrab();
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
          Definition(S, ws);
          continue interpreting;

        case "object": //отложенное вычисление?..
          if (Definition instanceof _WordStream) {
            RecursiveInterpret(S, Definition);
          }
          else continue findingDefinition;
      }
    }
    S.Stack.push(ParseValue(S, Tk)); //не нашли ни в одном замыкании => кидаем в стек "как есть"
  }
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
    return S.aux.RtvalueOf_Number(AsNumber);
  else //однозначно строка; других значений у нас пока нет
    return S.aux.RtvalueOf_String(Value);
}



class LLL_InterpreterError extends Error {};
