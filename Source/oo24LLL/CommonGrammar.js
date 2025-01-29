/** Начало строчного комментария */
export const TK_COMMENT_LINE_START = ";";

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
