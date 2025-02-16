import * as aux from "./aAux.js";
import * as CoGr from "./CommonGrammar.js";

export const Errors = {

  /*====== ERRORS ======*/

  /* ESX - Error SyntaX (Syntax errors) */

  /* p - Prelude */

  ESX_p101: () => `If there is an explicit end of the Prelude, there must also be an explicit beginning.`,

  ESX_p102: () => `Expected an explicit end of the Prelude (because the beginning is explicitly specified).`,

  ESX_p103: () => `Expected metadata-property key.`,

  ESX_p104: () => `Expected metadata-property value.`,

  ESX_p105: () => `Expected '${CoGr.Prelude.STRTABLE_ELEMENT_END}' at end of string.`,

  /** @param {string} Line */
  ESX_p106: (Line) => `Failed to process this line from string table block.\n\tLine: '${Line}'`,

  ESX_p107: () => `Expected '${CoGr.Prelude.STRTABLE_END}' at end of string table block.`,

  /* --- */

  ESX_1001: () => `Expected end of the block.`,

  ESX_1002: () => `'${CoGr.Instr.LOOP_RESTART}' instruction outside the loop.`,

  ESX_1003: () => `'${CoGr.Instr.LOOP_BREAK}' instruction outside the loop.`,



  
  /* ERT - Error RunTime (Runtime errors) */

  /** @param {string} Word */
  ERT_1001: (Word) => `Undefined word: '${Word}'`,

  /** @param {number} Needed   @param {number} Got */
  ERT_1002: (Needed, Got) => `Not enough values on stack.\n\tExpected: '${Needed}'\n\tGot: '${Got}'`,

  /** @param {string} Word   @param {string} JSType */
  ERT_1003: (Word, JSType) => `Definition of a post-block instruction must be a native function.\n\tInstruction: '${Word}'\n\tDefinition JavaScript-type: '${JSType}'`,

  /** @param {number} StrIndex */
  ERT_1004: (StrIndex) => `String with index '${StrIndex}' not found.`,









  /*====== EXCEPTIONS ======*/

  /* XRT - eXception RunTime (Runtime exceptions) */

  /* i - Internal */

  /** @param {string} JSType */
  XRT_i101: (JSType) => `[internal] Unsupported JavaScript-runtime definition type: '${JSType}'`,

  /** @param {string} Proto */
  XRT_i102: (Proto) => `[internal] Unsupported JavaScript-runtime definition object type.\n\tPrototype: '${Proto}'`,

  XRT_i103: () => `[internal] Uncaught: 'LLL_STATE#StateStorage.PostBlock' is null`,



  /* XM - eXception Mixed (Multi-class/Unknown-class exceptions) */

  XM_1001: () => `Expected escape character, got end of string`,

  /** @param {string} Char */
  XM_1002: (Char) => `Non-existent special character: '\\${Char}'`,

  /** @param {any} Value */
  XM_1003: (Value) => `The given value cannot be converted to Integer/Float.\n\tValue: '${Value}'`,

};

export const Warnings = {
  /** @param {LLL_STATE} S */
  W_1001: (S) => `When the program exits, the stack must be empty.\n\tStack:\n`
    + aux.GetStateTrace.Stack(S),
};



/**
 * Предупреждения, включённые по умолчанию.
 * Только критические.
 * @type {readonly KnownWarningCode[]}
 */
export const DefaultWarnings = [];
