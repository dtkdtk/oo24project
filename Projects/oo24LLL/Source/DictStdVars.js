import GetJson from "../../GetJson.js";
const PkgJson = GetJson("./Projects/oo24LLL/package.json");

/**
 * @internal
 * Словарь констант и встроенных базовых значений (например, true/false).
 * 
 * @type {Dictionary}
 */
export default new Map(Object.entries({

  /**
   * @since `v0.0.5`
   */
  Current_Interpreter_Version: PkgJson.version,

  /**
   * @since `v0.0.5`
   */
  Current_Interpreter_Build: PkgJson.version,

  /**
   * @since `v0.0.5`
   */
  Current_Interpreter_Name: "oo24LLL-theo.js",

  /**
   * @since `v0.0.5`
   */
  true: 1,

  /**
   * @since `v0.0.5`
   */
  false: 0,

  /**
   * @since `v0.0.5`
   */
  null: 0,
}));
