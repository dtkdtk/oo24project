import benchmark from "benchmark";
import * as oo24LLL_v0_0_2 from "../Asset_oo24_v0.0.2.cjs";
import * as oo24LLL_v0_0_1 from "../Asset_oo24_v0.0.1.cjs";

const Keep = value => {}; 

console.time("all benchmarks");

TEST(13, 1, () =>
  TEST(13, 50, () =>
    TEST(24, 1, () =>
      TEST(24, 50, () =>
        TEST(39, 1, () =>
          console.timeEnd("all benchmarks"))))));


function TEST(FIB_INDEX, TIMES, onComplete_Callback) {
  const SuiteName = `${FIB_INDEX}' num x${TIMES}`;
  const FibSuite = new benchmark.Suite(SuiteName);
  console.log(SuiteName);

  FibSuite.add("Regular JavaScript (using loops)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      let a = 0;
      let b = 1;
      let fib = 0;
      for (let i = 2; i <= FIB_INDEX; i++) {
        fib = a + b;
        a = b;
        b = fib;
      }
      Keep(fib);
    }
  });

  FibSuite.add("Regular JavaScript (using recursion)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      const fib = __RecursiveFibonacci(FIB_INDEX);
      Keep(fib);
    }
  });

  FibSuite.add("OLD oo24LLL OLD (using stupid code duplication)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      oo24LLL_v0_0_1.LLL_EXECUTE(`
        0 1 1             ;1,2,3
        dupsub dup sum    ;4
        ${"dupsub dupsub sum ".repeat(FIB_INDEX - 4)}
      `);
    }
  });

  FibSuite.add("Regular oo24LLL v0.0.2 (using stupid code duplication)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      oo24LLL_v0_0_2.LLL_EXECUTE(`
        0 1 1             ;1,2,3
        dupsub dup sum    ;4
        ${"dupsub dupsub sum ".repeat(FIB_INDEX - 4)}
      `);
    }
  });

  FibSuite.on('cycle', function(event) {
    console.log("\t" + String(event.target));
  });
  FibSuite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
    onComplete_Callback?.();
  });

  FibSuite.run({ async: true });
}



function __RecursiveFibonacci(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return __RecursiveFibonacci(n - 1) + __RecursiveFibonacci(n - 2);
}

/*
My results:

13' num x1
        Regular JavaScript (using loops) x 101,322,298 ops/sec ±0.20% (90 runs sampled)
        Regular JavaScript (using recursion) x 399,715 ops/sec ±0.39% (92 runs sampled)
        OLD oo24LLL OLD (using stupid code duplication) x 57,471 ops/sec ±0.84% (95 runs sampled)
        Regular oo24LLL v0.0.2 (using stupid code duplication) x 36,633 ops/sec ±0.32% (91 runs sampled)
Fastest is Regular JavaScript (using loops)
13' num x50
        Regular JavaScript (using loops) x 2,663,803 ops/sec ±0.16% (96 runs sampled)
        Regular JavaScript (using recursion) x 8,118 ops/sec ±0.45% (98 runs sampled)
        OLD oo24LLL OLD (using stupid code duplication) x 1,197 ops/sec ±0.18% (97 runs sampled)
        Regular oo24LLL v0.0.2 (using stupid code duplication) x 744 ops/sec ±0.21% (96 runs sampled)
Fastest is Regular JavaScript (using loops)
24' num x1
        Regular JavaScript (using loops) x 59,339,622 ops/sec ±1.04% (94 runs sampled)
        Regular JavaScript (using recursion) x 2,041 ops/sec ±0.26% (97 runs sampled)
        OLD oo24LLL OLD (using stupid code duplication) x 35,166 ops/sec ±0.17% (97 runs sampled)
        Regular oo24LLL v0.0.2 (using stupid code duplication) x 22,398 ops/sec ±0.84% (92 runs sampled)
Fastest is Regular JavaScript (using loops)
24' num x50
        Regular JavaScript (using loops) x 1,392,919 ops/sec ±0.13% (96 runs sampled)
        Regular JavaScript (using recursion) x 40.81 ops/sec ±0.24% (54 runs sampled)
        OLD oo24LLL OLD (using stupid code duplication) x 702 ops/sec ±0.30% (93 runs sampled)
        Regular oo24LLL v0.0.2 (using stupid code duplication) x 449 ops/sec ±1.83% (92 runs sampled)
Fastest is Regular JavaScript (using loops)
39' num x1
        Regular JavaScript (using loops) x 30,050,897 ops/sec ±0.46% (93 runs sampled)
        Regular JavaScript (using recursion) x 1.50 ops/sec ±0.08% (8 runs sampled)
        OLD oo24LLL OLD (using stupid code duplication) x 21,701 ops/sec ±0.17% (96 runs sampled)
        Regular oo24LLL v0.0.2 (using stupid code duplication) x 14,312 ops/sec ±0.13% (96 runs sampled)
Fastest is Regular JavaScript (using loops)
all benchmarks: 2:09.878 (m:ss.mmm)     
*/
