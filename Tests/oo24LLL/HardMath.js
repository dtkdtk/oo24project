import { LLL_EXECUTE } from "../../Source/include.js";
const LOOPS_COUNT = 1000000;
const FIB_INDEX = 48;

for (let _J = 0; _J < LOOPS_COUNT; _J++) {
  LLL_EXECUTE(`
    0 1 1             ;1,2,3
    dupsub dup sum    ;4
    ${"dupsub dupsub sum (nl)".repeat(FIB_INDEX - 4)}
  `);
}
