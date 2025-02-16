import benchmark from "benchmark";
import * as oo24LLL_v0_0_5 from "../Asset_oo24_v0.0.5.cjs";
import * as oo24LLL_v0_0_4 from "../Asset_oo24_v0.0.4.cjs";
import * as oo24LLL_v0_0_3 from "../Asset_oo24_v0.0.3.cjs";
import * as oo24LLL_v0_0_2 from "../Asset_oo24_v0.0.2.cjs";
import * as oo24LLL_v0_0_1 from "../Asset_oo24_v0.0.1.cjs";
import * as One3L_v0_1 from "../Asset_One3L_v0.1.cjs";

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

  FibSuite.add("JavaScript (loops)", function() {
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

  FibSuite.add("JavaScript (recursion)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      const fib = __RecursiveFibonacci(FIB_INDEX);
      Keep(fib);
    }
  });

  FibSuite.add("One3L v0.1 : Compact JS implementation (stupid code duplication)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      oo24LLL_v0_0_1.LLL_EXECUTE(`
        0 1 1             (1,2,3)
        dupsub dup [+]    (4)
        ${"dupsub dupsub [+] ".repeat(FIB_INDEX - 4)}
      `);
    }
  });

  FibSuite.add("oo24LLL v0.0.1 : Prototype (stupid code duplication)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      oo24LLL_v0_0_1.LLL_EXECUTE(`
        0 1 1             ;1,2,3
        dupsub dup sum    ;4
        ${"dupsub dupsub sum ".repeat(FIB_INDEX - 4)}
      `);
    }
  });

  FibSuite.add("oo24LLL v0.0.2 : NativeBinaryValues (stupid code duplication)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      oo24LLL_v0_0_2.LLL_EXECUTE(`
        0 1 1             ;1,2,3
        dupsub dup sum    ;4
        ${"dupsub dupsub sum ".repeat(FIB_INDEX - 4)}
      `);
    }
  });

  FibSuite.add("oo24LLL v0.0.3 : Downgraded (stupid code duplication)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      oo24LLL_v0_0_3.LLL_EXECUTE(`
        0 1 1             ;1,2,3
        dupsub dup sum    ;4
        ${"dupsub dupsub sum ".repeat(FIB_INDEX - 4)}
      `);
    }
  });

  FibSuite.add("oo24LLL v0.0.4 : Regular (stupid code duplication)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      const S = new oo24LLL_v0_0_4.LLL_STATE();
      S.StdERR = () => {};
      S.StdOUT = () => {};
      oo24LLL_v0_0_4.LLL_EXECUTE(`
        0 1 1             ;1,2,3
        dupsub dup sum    ;4
        ${"dupsub dupsub sum ".repeat(FIB_INDEX - 4)}
      `, S);
    }
  });

  FibSuite.add("oo24LLL v0.0.5 : Regular (stupid code duplication)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      oo24LLL_v0_0_5.LLL_EXECUTE(`
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
        JavaScript (loops) x 90,615,038 ops/sec ±4.60% (88 runs sampled)
        JavaScript (recursion) x 347,372 ops/sec ±5.54% (84 runs sampled)
        One3L v0.1 : Compact JS implementation x 57,567 ops/sec ±2.92% (87 runs sampled)
        oo24LLL v0.0.1 : Prototype (stupid code duplication) x 57,939 ops/sec ±0.63% (91 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (stupid code duplication) x 34,214 ops/sec ±0.84% (87 runs sampled)
        oo24LLL v0.0.3 : Downgraded (stupid code duplication) x 375,713 ops/sec ±0.74% (92 runs sampled)
        oo24LLL v0.0.4 : Regular (stupid code duplication) x 205,669 ops/sec ±1.32% (93 runs sampled)
        oo24LLL v0.0.5 : Regular (stupid code duplication) x 200,664 ops/sec ±0.29% (96 runs sampled)
Fastest is JavaScript (loops)
13' num x50
        JavaScript (loops) x 2,636,886 ops/sec ±0.51% (96 runs sampled)
        JavaScript (recursion) x 8,142 ops/sec ±0.19% (97 runs sampled)
        One3L v0.1 : Compact JS implementation x 1,164 ops/sec ±2.30% (91 runs sampled)
        oo24LLL v0.0.1 : Prototype (stupid code duplication) x 1,178 ops/sec ±0.59% (93 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (stupid code duplication) x 685 ops/sec ±1.26% (89 runs sampled)        oo24LLL v0.0.3 : Downgraded (stupid code duplication) x 6,956 ops/sec ±4.34% (82 runs sampled)
        oo24LLL v0.0.4 : Regular (stupid code duplication) x 3,930 ops/sec ±4.44% (91 runs sampled)
        oo24LLL v0.0.5 : Regular (stupid code duplication) x 3,824 ops/sec ±2.42% (91 runs sampled)
Fastest is JavaScript (loops)
24' num x1
        JavaScript (loops) x 55,934,870 ops/sec ±2.47% (86 runs sampled)
        JavaScript (recursion) x 1,890 ops/sec ±2.51% (86 runs sampled)
        One3L v0.1 : Compact JS implementation x 35,610 ops/sec ±0.90% (91 runs sampled)
        oo24LLL v0.0.1 : Prototype (stupid code duplication) x 33,640 ops/sec ±1.70% (93 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (stupid code duplication) x 20,264 ops/sec ±2.63% (91 runs sampled)
        oo24LLL v0.0.3 : Downgraded (stupid code duplication) x 238,185 ops/sec ±2.55% (91 runs sampled)
        oo24LLL v0.0.4 : Regular (stupid code duplication) x 156,408 ops/sec ±0.76% (92 runs sampled)
        oo24LLL v0.0.5 : Regular (stupid code duplication) x 144,671 ops/sec ±0.89% (89 runs sampled)
Fastest is JavaScript (loops)
24' num x50
        JavaScript (loops) x 1,350,050 ops/sec ±2.18% (91 runs sampled)
        JavaScript (recursion) x 40.10 ops/sec ±0.71% (53 runs sampled)
        One3L v0.1 : Compact JS implementation x 708 ops/sec ±1.70% (90 runs sampled)
        oo24LLL v0.0.1 : Prototype (stupid code duplication) x 684 ops/sec ±0.62% (93 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (stupid code duplication) x 416 ops/sec ±0.78% (91 runs sampled)        oo24LLL v0.0.3 : Downgraded (stupid code duplication) x 5,098 ops/sec ±0.13% (97 runs sampled)
        oo24LLL v0.0.4 : Regular (stupid code duplication) x 3,226 ops/sec ±0.13% (98 runs sampled)
        oo24LLL v0.0.5 : Regular (stupid code duplication) x 3,028 ops/sec ±0.17% (97 runs sampled)
Fastest is JavaScript (loops)
39' num x1
        JavaScript (loops) x 29,916,052 ops/sec ±0.66% (93 runs sampled)
        JavaScript (recursion) x 1.49 ops/sec ±0.22% (8 runs sampled)
        One3L v0.1 : Compact JS implementation x 20,847 ops/sec ±6.24% (87 runs sampled)
        oo24LLL v0.0.1 : Prototype (stupid code duplication) x 18,764 ops/sec ±6.03% (82 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (stupid code duplication) x 12,840 ops/sec ±2.58% (90 runs sampled)
        oo24LLL v0.0.3 : Downgraded (stupid code duplication) x 152,860 ops/sec ±5.86% (88 runs sampled)    
        oo24LLL v0.0.4 : Regular (stupid code duplication) x 110,170 ops/sec ±3.42% (89 runs sampled)       
        oo24LLL v0.0.5 : Regular (stupid code duplication) x 105,830 ops/sec ±2.41% (88 runs sampled)       
Fastest is JavaScript (loops)
all benchmarks: 4:17.687 (m:ss.mmm)

*/
