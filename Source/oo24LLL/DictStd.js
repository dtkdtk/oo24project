/**
 * @internal
 * Словарь стандартных (встроенных) функций.
 * 
 * @type {Map<string, import("./Interpreter").NativeJsFunction>}
 */
export default new Map(Object.entries({

////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Дублировать верхушку стека.
   * @signature `[value] dup`
   */
  dup: (S, ws) => {
    S.aux.AssertStackLength(1);
    S.Stack.push(S.Stack.peek());
  },

  /**
   * Снять значение с верхушки стека.
   * @signature `[value] drop`
   */
  drop: (S, ws) => {
    S.aux.AssertStackLength(1);
    S.Stack.pop();
  },

////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Конкатенирует пред-вершину стека с вершиной.
   * @signature `[dest] [source] concat`
   */
  concat: (S, ws) => {
    S.aux.AssertStackLength(2);
    const Source = S.Stack.pop();
    const Dest = S.Stack.pop();
    S.Stack.push( String(Source).concat(Dest) );
  },

  /**
   * Выводит вершину стека в консоль, ИЗВЛЕКАЯ её.
   * @signature `[value] print`
   */
  print: (S, ws) => {
    S.aux.AssertStackLength(1);
    console.log( S.Stack.pop() );
  },
  
////////////////////////////////////////////////////////////////////////////////////////

  /*
   * Базовые БИНАРНЫЕ математические операции.
   * Все имеют сигнатуру `[from] [to] OPERATION`
   */

  sum: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.AsNumber(S.Stack.pop());
    const To = S.aux.AsNumber(S.Stack.pop());
    S.Stack.push( From + To );
  },
  sub: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.AsNumber(S.Stack.pop());
    const To = S.aux.AsNumber(S.Stack.pop());
    S.Stack.push( From - To );
  },
  mul: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.AsNumber(S.Stack.pop());
    const To = S.aux.AsNumber(S.Stack.pop());
    S.Stack.push( From * To );
  },
  div: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.AsNumber(S.Stack.pop());
    const To = S.aux.AsNumber(S.Stack.pop());
    S.Stack.push( From / To );
  },
  mod: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.AsNumber(S.Stack.pop());
    const To = S.aux.AsNumber(S.Stack.pop());
    S.Stack.push( From % To );
  },

}));
