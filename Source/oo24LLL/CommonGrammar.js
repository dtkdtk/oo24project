/** Начало строчного комментария */
export const TK_COMMENT_LINE_START = ";";

/** Начало встраиваемого комментария */
export const TK_INLINE_COMMENT_START = "(";

/** Конец встраиваемого комментария */
export const TK_INLINE_COMMENT_END = ")";

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
  STRTABLE_ELEMENT_START: "STRING",

  /** @readonly */
  STRTABLE_ELEMENT_END: "END",
  
  /** @readonly */
  STRTABLE_END: "...END_TABLE",
};
