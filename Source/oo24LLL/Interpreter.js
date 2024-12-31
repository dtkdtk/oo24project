import assert from "node:assert";
import DictSyntax from "./DictSyntax.js";
import DictStd from "./DictStd.js";
import * as LibUtils from "../Utils.js";
import * as LibUtilsTy from "../Utils-typed.js";
import { _AuxGetStateStace } from "./AuxStateTrace.js";

/** Начало комментария */
const TK_COMMENT_START = ";";



/* TYPES: */
/**
 * @typedef {string | number} prim
 */
/**
 * @typedef {(S: LLL_STATE, ws: WordStream) => unknown} NativeJsFunction
 */
/**
 * @typedef {"IgnoreWord"} KnownPragmaKeys
 */

/**
 * @param {string} AllCode 
 */
export function LLL_EXECUTE(AllCode, S = new LLL_STATE()) {
  AllCode = InterpretPrelude(AllCode, S);
  if (AllCode.length == 0) return;

  const TheStream = new WordStream(AllCode);
  RecursiveInterpret(S, TheStream);
}



/**
 * Состояние интерпретатора LLL.
 */
export class LLL_STATE {

  /**
   * @type {Record<string, prim>}
   * @readonly
   */
  ScriptMetadata = {};

  /**
   * @type {}
   * @readonly
   */
  Pragmas = {};

  /**
   * @type {string[]}
   * @readonly
   */
  StringsTable = [];

  /**
   * @type {LibUtilsTy.IStack<prim>}
   * @readonly
   */
  Stack = new LibUtilsTy.IStack();

  /**
   * Стек *замыканий*: областей видимости слов(функций) и переменных.
   * @type {LibUtilsTy.IStack<Map<string, prim | NativeJsFunction | WordStream>>}
   * @readonly
   */
  Closures = new LibUtilsTy.IStack( //Замыкания по умолчанию:
    DictSyntax,
    DictStd,
    new Map(),
  );

  /**
   * Набор вспомогательных функций.
   * @readonly
   */
  aux = { //Использовать исключительно стрелочные функции!!!

    /**
     * Выбрасывает RuntimeException.
     * @param {string} Msg
     * @returns {never}
     */
    ThrowRuntimeExc: (Msg) => {
      console.error("LLL Runtime exception: " + Msg + "\n");
      console.error(this.aux.GetStateTrace());
      throw "LLL RuntimeException";
    },

    /**
     * Специализация `ThrowRuntimeExc` с пояснением места, где возникла ошибка.
     * @param {string} Where 
     * @param {string} Msg 
     * @returns {never}
     */
    ThrowRuntimeExc_At: (Where, Msg) => this.aux.ThrowRuntimeExc(`'${Where}': ${Msg}`),

    /**
     * Проверяет, достаточно ли значений в стеке.
     * @param {number} Needed
     * @param {string} ThisFnName
     * @returns {void | never}
     */
    AssertStackLength: (Needed) => {
      if (this.Stack.length < Needed)
      this.aux.ThrowRuntimeExc_At(this.CurrentInterpretingWord, "Not enough values on stack."
        + `\n\tExpected '${Needed}', stack contains '${this.Stack.length}'.`)
    },

    /**
     * Возвращает `LLL_STATE`, готовую к выводу в консоль.
     * @returns {string}
     */
    GetStateTrace: () => _AuxGetStateStace(this),

    /**
     * Конвертирует значение в число.
     * При неудаче выкидывает исключение.
     * @param {prim} Val
     * @returns {number | never}
     */
    AsNumber: (Val) => {
      const Num = Number(Val);
      if (isNaN(Num))
        return this.aux.ThrowRuntimeExc_At(this.CurrentInterpretingWord, `Expected number, received '${Val}'.`);
      return Num;
    },

    /**
     * Конвертирует указанное значение в нужный Runtime-тип данных.
     * Грубо говоря, "парсит" строку и пытается конвертировать в числовой тип данных.
     * @param {string} Value
     * @returns {prim}
     */
    ResolveValue,
  };

  /**
   * Интерпретируемое в данный момент слово.
   * @type {string}
   * @readonly
   */
  CurrentInterpretingWord; //Ответственность закреплена за 'RecursiveInterpret'
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
    Line = PrepareCodeLine(Line);
    if (Line.length == 0) continue;
    
    const ParsedLine = Line.split(" ");
    switch (ParsedLine[0]) {
      case "META": {
        assert(ParsedLine.length > 2, "Неправильное использование директивы 'META'. Ожидался ключ и значение поля.");
        let [Key, Value] = ParsedLine.slice(1);
        Value = ResolveValue(Value);
        Key = Key.split(TK_COMMENT_START);
        Key = removeSuffix(Key, ":");
        S.ScriptMetadata[Key] = ResolveValue(Value);
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
  // вместо этого символа, стоит ввести в 'ResolveValue'

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
 * @param {WordStream} ws 
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
          if (Definition instanceof WordStream) {
            RecursiveInterpret(S, Definition);
          }
          else continue findingDefinition;
      }
    }
    S.Stack.push(ResolveValue(Tk)); //не нашли ни в одном замыкании => кидаем в стек "как есть"
  }
}



/**
 * Вырезает комментарии, лишние пробелы и т.д.
 * @param {string} Line 
 * @returns {string}
 */
function PrepareCodeLine(Line) {
  return Line
    .split(";", 1)[0] //строчные комментарии
    .replaceAll(/\(.*?\)/g, '') //встраиваемые комментарии
    .replaceAll(/( )+/g, ' ') //двойные пробелы
    .trim(); //лишние пробелы в начале/конце
}

/**
 * Конвертирует указанное значение в нужный Runtime-тип данных.
 * Грубо говоря, "парсит" строку и пытается конвертировать в числовой тип данных.
 * @param {string} Value
 * @returns {prim}
 */
function ResolveValue(Value) {
  const AsNumber = Number(Value);
  if (!isNaN(AsNumber))
    return AsNumber;
  else
    return Value;
}



/**
 * Поток СЛОВ.
 * Специализирован под LLL.
 */
class WordStream {
  #LineIndex = 0;
  get LineIndex() {
    return this.#LineIndex;
  }

  /** @type {string[]} */
  #Lines = [];

  /** @type {string[]} */
  #CurrentLine = [];

  /**
   * @param {string} AllCode 
   */
  constructor(AllCode) {
    this.#Lines = AllCode.split(/\r?\n/);
  }

  /**
   * Берёт текущий символ (со сдвигом потока).
   * 
   * Проверка конца кода на вашей совести!
   * @returns {string}
   */
  tkGrab() {
    return this.#CurrentLine.shift();
  }

  /**
   * Проверяет наличие слов в `#CurrentLine`,
   * иначе - дополняет **с вырезанием комментариев и лишних пробелов**
   * @returns {boolean} НЕ достигнут ли конец кода?
   * @mutates
   */
  tkRefillLineBuff() {
    if (this.#EndOfCode()) return false;
    if (this.#CurrentLine.length == 0) {
      let RawLine = this.#Lines[this.#LineIndex];
      RawLine = PrepareCodeLine(RawLine);
      this.#LineIndex++;
      if (RawLine.length == 0) return this.tkRefillLineBuff();

      this.#CurrentLine = RawLine.split(/\s/).filter(word => word != "");
      return true;
    }
    return true;
  }

  /**
   * Больше кода нету?
   */
  #EndOfCode() {
    return this.#LineIndex == this.#Lines.length
      && this.#CurrentLine.length == 0;
  }
}



class LLL_InterpreterError extends Error {};

/**
 * @param {string} Str 
 * @param {string} Suffix 
 * @returns {string}
 */
function removeSuffix(Str, Suffix) {
  const Index = Str.lastIndexOf(Suffix);
  if (Index == -1)
    return Str;
  else
    return Str.slice(0, Index);
}
