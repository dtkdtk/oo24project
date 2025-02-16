import * as aux from "./aAux.js";

/**
 * @internal
 * Словарь стандартных (встроенных) функций.
 * 
 * @type {Dictionary}
 */
export default new Map(Object.entries({
  
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

  //////////////////////////////////////////////////////////////////////////////////////

  /**
   * Получает из таблицы строк строку с указанным индексом (`strindex`)
   * и возвращает её.
   * @signature `[strindex] string`
   * @since `v0.0.1`
   */
  string: (S) => {
    aux.AssertStackLength(S, 1);
    const StrIndex = aux.Pop_Number(S);
    aux.Assert(S, StrIndex >= 0 && StrIndex <= S.StringsTable.length,
      "LLL RuntimeError", "ERT_1004", StrIndex);

    const StringFromTable = S.StringsTable[StrIndex];
    aux.Assert(S, StringFromTable !== undefined,
      "LLL RuntimeError", "ERT_1004", StrIndex);

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

  /**
   * Очищает стек.
   * @signature `[...values] clear_stack`
   * @since `v0.0.5`
   */
  clear_stack: (S) => {
    /* Мы не можем взять и присвоить 'LLL_STATE#Stack' значение '[]' (пустой массив),
    |  т.к. это сломает ссылки на него (=> потенциальное UB).
    Вместо этого мы просто пользуемся специфичными для JavaScript трюками:
    |  например, запись в поле 'Array#length'. */
    //@ts-expect-error
    S.Stack.length = 0;
  },
  
  //////////////////////////////////////////////////////////////////////////////////////

  /**
   * Отключает вывод указанного предупреждения в консоль.
   * Если уже отключено - ничего не происходит.
   * @signature `[warncode] disable_warning`
   * @since `v0.0.5`
   */
  disable_warning: (S) => {
    aux.AssertStackLength(S, 1);
    const ECode = aux.Pop_String(S);
    S.StateStorage.IgnoredWarnings.add(ECode);
  },

  /**
   * Включает обратно вывод указанного предупреждения в консоль.
   * Если и так включено - ничего не происходит.
   * @signature `[warncode] disable_warning`
   * @since `v0.0.5`
   */
  enable_warning: (S) => {
    aux.AssertStackLength(S, 1);
    const ECode = aux.Pop_String(S);
    S.StateStorage.IgnoredWarnings.delete(ECode);
  },

}));
