import * as aux from "./aAux.js";

/**
 * @internal
 * Словарь стандартных (встроенных) функций.
 * 
 * @type {LLL_Dictionary}
 */
export default new Map(Object.entries({

  ////////////////////////////////////////////////////////////////////////////////////////
  
    /**
     * Дублировать верхушку стека.
     * @signature `[value] dup`
     * @since `v0.0.1`
     */
    dup: (S) => {
      aux.AssertStackLength(S, 1);
      S.Stack.push(S.Stack.peek());
    },
  
    /**
     * Дублирует СУБ-верхушку стека.
     * @signature `[value] [(top)] dupsub`
     * @since `v0.0.2`
     */
    dupsub: (S) => {
      aux.AssertStackLength(S, 2);
      const Top = S.Stack.pop();
      const Subtop = S.Stack.peek();
      S.Stack.push(Top);
      S.Stack.push(Subtop);
    },
  
    /**
     * Снять значение с верхушки стека.
     * @signature `[value] drop`
     * @since `v0.0.2`
     */
    drop: (S) => {
      aux.AssertStackLength(S, 1);
      S.Stack.pop();
    },
  
  ////////////////////////////////////////////////////////////////////////////////////////
  
    /**
     * Получает из таблицы строк строку с указанным индексом (`strindex`)
     * и возвращает её.
     * @signature `[strindex] string`
     * @since `v0.0.1`
     */
    string: (S) => {
      aux.AssertStackLength(S, 1);
      const StrIndex = aux.Pop_Number(S);
      aux.Assert(S, StrIndex >= 0 && StrIndex <= S.StringsTable.length, `String with index '${StrIndex}' not found.`);
  
      const StringFromTable = S.StringsTable[StrIndex];
      aux.Assert(S, StringFromTable !== undefined, `String not found.`);
  
      S.Stack.push(StringFromTable);
    },
  
    /**
     * Конкатенирует пред-вершину стека с вершиной.
     * @signature `[dest] [source] concat`
     * @since `v0.0.1`
     */
    concat: (S) => {
      aux.AssertStackLength(S, 2);
      const Source = aux.Pop_String(S);
      const Dest = aux.Pop_String(S);
      S.Stack.push(Source.concat(Dest));
    },
  
    /**
     * Выводит вершину стека в консоль, ИЗВЛЕКАЯ её.
     * @signature `[value] print`
     * @since `v0.0.1`
     */
    print: (S) => {
      aux.AssertStackLength(S, 1);
      S.StdOUT(aux.Pop_String(S));
    },
    
  ////////////////////////////////////////////////////////////////////////////////////////
  
    /*
     * Базовые БИНАРНЫЕ математические операции.
     * Все имеют сигнатуру `[from] [to] OPERATION`
     * @since `v0.0.1`
     */
  
    sum: (S) => {
      aux.AssertStackLength(S, 2);
      const From = aux.Pop_Number(S);
      const To = aux.Pop_Number(S);
      S.Stack.push(From + To);
    },
    sub: (S) => {
      aux.AssertStackLength(S, 2);
      const From = aux.Pop_Number(S);
      const To = aux.Pop_Number(S);
      S.Stack.push(From - To);
    },
    mul: (S) => {
      aux.AssertStackLength(S, 2);
      const From = aux.Pop_Number(S);
      const To = aux.Pop_Number(S);
      S.Stack.push(From * To);
    },
    div: (S) => {
      aux.AssertStackLength(S, 2);
      const From = aux.Pop_Number(S);
      const To = aux.Pop_Number(S);
      S.Stack.push(Math.floor(From / To));
    },
    mod: (S) => {
      aux.AssertStackLength(S, 2);
      const From = aux.Pop_Number(S);
      const To = aux.Pop_Number(S);
      S.Stack.push(From % To);
    },
  
}));
