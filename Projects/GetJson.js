import { readFileSync } from "node:fs";

/**
 * Читает `json`-файл по пути, относительному CWD.
 * @param {string} JsonPath 
 */
export default function GetJson(JsonPath) {
  const File = readFileSync(JsonPath, "utf8");
  const Json = JSON.parse(File);
  return Json;
}
