/**
 * @internal
 * Словарь стандартных (встроенных) функций.
 * 
 * @type {Map<string, NativeJsFunction>}
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
    const Source = S.aux.PopValue_String();
    const Dest = S.aux.PopValue_String();
    S.Stack.push(S.aux.RtvalueOf( Source.concat(Dest) ));
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
    const From = S.aux.PopValue_Integer();
    const To = S.aux.PopValue_Integer();
    S.Stack.push(S.aux.RtvalueOf( From + To ));
  },
  sub: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.PopValue_Integer();
    const To = S.aux.PopValue_Integer();
    S.Stack.push(S.aux.RtvalueOf( From - To ));
  },
  mul: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.PopValue_Integer();
    const To = S.aux.PopValue_Integer();
    S.Stack.push(S.aux.RtvalueOf( From * To ));
  },
  div: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.PopValue_Integer();
    const To = S.aux.PopValue_Integer();
    S.Stack.push(S.aux.RtvalueOf( ~~(From / To) ));
  },
  mod: (S, ws) => {
    S.aux.AssertStackLength(2);
    const From = S.aux.PopValue_Integer();
    const To = S.aux.PopValue_Integer();
    S.Stack.push(S.aux.RtvalueOf( From % To ));
  },

}));
