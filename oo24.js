import { LLL_EXECUTE } from "./Source/oo24LLL/Interpreter.js";
import { program } from "commander";
import * as libFs from "node:fs";
const pkgJson = JSON.parse(libFs.readFileSync("./package.json", "utf-8"));

program
  .name("oo24")
  .description("Gāi xiàngmù zhèngzài kāifā zhōng")
  .version(pkgJson.version)
;

program.command("lllexec")
  .description("Executes the specified file with the source oo24LLL code.")
  .argument("<filepath>", "path to .LLL file")
  .action(function () {
    const filepath = this.args[0];

    try       { libFs.accessSync(filepath)                  }
    catch (_) { this.error(`File not found: '${filepath}'`) } 

    const fileContent = libFs.readFileSync(filepath, "utf-8");
    LLL_EXECUTE(fileContent);
  })
;

program.parse();
