/** Начало строчного комментария (вариант A) */
export const TK_COMMENT_LINE_START_A = ";";

/** Начало строчного комментария (вариант B) */
export const TK_COMMENT_LINE_START_B = "#";

/**
 * Начало/конец номинальной строки (той, что просто ссылается на слово,
 * и может быть изменена при компиляции).
 */
export const TK_NOMINAL_STRING = '`';

/**
 * Начало/конец виртуальной строки (важна в рантайме, мутировать при компиляции нельзя).
 */
export const TK_VIRTUAL_STRING = '"';

/** Начало встраиваемого комментария */
export const TK_INLINE_COMMENT_START = "(";

/** Конец встраиваемого комментария */
export const TK_INLINE_COMMENT_END = ")";

/** Ограничитель секций областей видимости (ставится между элементами 'LLL_STATE#VirtualScope') */
export const TK_SCOPE_SEPARATOR = "@@-";

/** Конец блока определения (или замыкания) */
export const INSTR_END_OF_BLOCK = "...END";

/** Всё, что связано с Прелюдией */
export const Prelude = {
  /** @readonly */
  EXPLICIT_START_PRELUDE: "PRELUDE...",

  /** @readonly */
  EXPLICIT_END_PRELUDE: "...END_PRELUDE",

  /** @readonly */
  META: "META",

  /** @readonly */
  STRTABLE_START: "STRINGS_TABLE...",

  /** @readonly */
  STRTABLE_ELEMENT_START: "^START",

  /** @readonly */
  STRTABLE_ELEMENT_END: "^END",
  
  /** @readonly */
  STRTABLE_END: "...END_TABLE",
};

/** Языковые инструкции, ключевые слова */
export const Instr = {
  /** @readonly */
  DEFINE_VAR: "DEFINE",

  /** @readonly */
  DELETE_DEFINITION: "DELETE",

  /** @readonly */
  LOOP_BREAK: "BREAK_LOOP",

  /** @readonly */
  LOOP_RESTART: "SKIP_ITERATION",

  /** @readonly */
  EnterScope: MakeIntrinsic("EnterScope"),

  /** @readonly */
  ExitScope: MakeIntrinsic("ExitScope"),

  /** @readonly */
  ExecuteCondition: MakeIntrinsic("ExecuteCondition"),
};

/** Языковые конструкции. ТРЕБУЮТ ЗАКРЫТИЕ БЛОКА - '...END' */
export const Constrct = {
  
  /** @readonly */
  DEFINE_FUNC: "DEFINE...",

  /** @readonly */
  CONDITION_THEN: "THEN...",

  /** @readonly */
  CONDITION_ELSE: "ELSE...",

  /** @readonly */
  LOOP: "LOOP...",
};

/**
 * Добавляет типичный intrinsic-префикс символу.
 * @param {string} Sym
 */
export function MakeIntrinsic(Sym) {
  return "@__" + Sym + "__@";
}
