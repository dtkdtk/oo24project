import benchmark from "benchmark";
import * as oo24LLL_v0_0_4 from "../Asset_oo24_v0.0.4.cjs";
import * as oo24LLL_v0_0_3 from "../Asset_oo24_v0.0.3.cjs";
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

  FibSuite.add("JavaScript (using loops)", function() {
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

  FibSuite.add("JavaScript (using recursion)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      const fib = __RecursiveFibonacci(FIB_INDEX);
      Keep(fib);
    }
  });

  FibSuite.add("oo24LLL v0.0.1 : Prototype (using stupid code duplication)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      oo24LLL_v0_0_1.LLL_EXECUTE(`
        0 1 1             ;1,2,3
        dupsub dup sum    ;4
        ${"dupsub dupsub sum ".repeat(FIB_INDEX - 4)}
      `);
    }
  });

  FibSuite.add("oo24LLL v0.0.2 : NativeBinaryValues (using stupid code duplication)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      oo24LLL_v0_0_2.LLL_EXECUTE(`
        0 1 1             ;1,2,3
        dupsub dup sum    ;4
        ${"dupsub dupsub sum ".repeat(FIB_INDEX - 4)}
      `);
    }
  });

  FibSuite.add("oo24LLL v0.0.3 : Downgraded (using stupid code duplication)", function() {
    for (let _J = 0; _J < TIMES; _J++) {
      oo24LLL_v0_0_3.LLL_EXECUTE(`
        0 1 1             ;1,2,3
        dupsub dup sum    ;4
        ${"dupsub dupsub sum ".repeat(FIB_INDEX - 4)}
      `);
    }
  });

  FibSuite.add("oo24LLL v0.0.4 : Regular (using stupid code duplication)", function() {
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
        JavaScript (using loops) x 93,679,689 ops/sec ±5.81% (78 runs sampled)
        JavaScript (using recursion) x 324,744 ops/sec ±9.93% (73 runs sampled)
        oo24LLL v0.0.1 : Prototype (using stupid code duplication) x 56,079 ops/sec ±2.39% (90 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (using stupid code duplication) x 36,823 ops/sec ±0.33% (92 runs sampled)
        oo24LLL v0.0.3 : Downgraded (using stupid code duplication) x 378,395 ops/sec ±0.16% (94 runs sampled)
        oo24LLL v0.0.4 : Regular (using stupid code duplication) x 208,772 ops/sec ±0.17% (96 runs sampled)
Fastest is JavaScript (using loops)
13' num x50
        JavaScript (using loops) x 2,663,418 ops/sec ±0.14% (95 runs sampled)
        JavaScript (using recursion) x 8,152 ops/sec ±0.14% (96 runs sampled)
        oo24LLL v0.0.1 : Prototype (using stupid code duplication) x 1,044 ops/sec ±6.98% (81 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (using stupid code duplication) x 753 ops/sec ±0.15% (94 runs sampled)
        oo24LLL v0.0.3 : Downgraded (using stupid code duplication) x 7,837 ops/sec ±0.15% (95 runs sampled)
        oo24LLL v0.0.4 : Regular (using stupid code duplication) x 4,243 ops/sec ±0.16% (96 runs sampled)
Fastest is JavaScript (using loops)
24' num x1
        JavaScript (using loops) x 60,948,736 ops/sec ±0.51% (97 runs sampled)
        JavaScript (using recursion) x 2,034 ops/sec ±0.60% (96 runs sampled)
        oo24LLL v0.0.1 : Prototype (using stupid code duplication) x 35,686 ops/sec ±0.20% (96 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (using stupid code duplication) x 22,195 ops/sec ±0.29% (96 runs sampled)
        oo24LLL v0.0.3 : Downgraded (using stupid code duplication) x 246,546 ops/sec ±0.17% (96 runs sampled)
        oo24LLL v0.0.4 : Regular (using stupid code duplication) x 158,602 ops/sec ±0.26% (96 runs sampled)
Fastest is JavaScript (using loops)
24' num x50
        JavaScript (using loops) x 1,391,186 ops/sec ±0.11% (93 runs sampled)
        JavaScript (using recursion) x 40.88 ops/sec ±0.15% (54 runs sampled)
        oo24LLL v0.0.1 : Prototype (using stupid code duplication) x 710 ops/sec ±0.12% (93 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (using stupid code duplication) x 461 ops/sec ±0.15% (92 runs sampled)
        oo24LLL v0.0.3 : Downgraded (using stupid code duplication) x 5,068 ops/sec ±0.16% (97 runs sampled)
        oo24LLL v0.0.4 : Regular (using stupid code duplication) x 3,175 ops/sec ±1.20% (97 runs sampled)
Fastest is JavaScript (using loops)
39' num x1
        JavaScript (using loops) x 30,027,511 ops/sec ±0.44% (89 runs sampled)
        JavaScript (using recursion) x 1.50 ops/sec ±0.19% (8 runs sampled)
        oo24LLL v0.0.1 : Prototype (using stupid code duplication) x 21,842 ops/sec ±0.25% (93 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (using stupid code duplication) x 14,374 ops/sec ±0.16% (95 runs sampled)
        oo24LLL v0.0.3 : Downgraded (using stupid code duplication) x 170,947 ops/sec ±0.16% (98 runs sampled)
        oo24LLL v0.0.4 : Regular (using stupid code duplication) x 116,667 ops/sec ±0.36% (94 runs sampled)
Fastest is JavaScript (using loops)
all benchmarks: 3:14.644 (m:ss.mmm)

*/
