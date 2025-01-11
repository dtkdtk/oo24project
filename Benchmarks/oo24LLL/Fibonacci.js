import benchmark from "benchmark";
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
        JavaScript (using loops) x 83,675,028 ops/sec ±5.87% (81 runs sampled)
        JavaScript (using recursion) x 384,683 ops/sec ±1.37% (87 runs sampled)
        oo24LLL v0.0.1 : Prototype (using stupid code duplication) x 55,637 ops/sec ±1.81% (87 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (using stupid code duplication) x 35,762 ops/sec ±0.44% (95 runs sampled)
        oo24LLL v0.0.3 : Downgraded (using stupid code duplication) x 378,164 ops/sec ±0.63% (87 runs sampled)
Fastest is JavaScript (using loops)
13' num x50
        JavaScript (using loops) x 2,690,249 ops/sec ±0.16% (95 runs sampled)
        JavaScript (using recursion) x 8,237 ops/sec ±0.11% (98 runs sampled)
        oo24LLL v0.0.1 : Prototype (using stupid code duplication) x 1,219 ops/sec ±0.35% (97 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (using stupid code duplication) x 737 ops/sec ±0.25% (95 runs sampled)
        oo24LLL v0.0.3 : Downgraded (using stupid code duplication) x 8,000 ops/sec ±0.12% (96 runs sampled)
Fastest is JavaScript (using loops)
24' num x1
        JavaScript (using loops) x 62,248,493 ops/sec ±0.18% (93 runs sampled)
        JavaScript (using recursion) x 2,049 ops/sec ±0.12% (98 runs sampled)
        oo24LLL v0.0.1 : Prototype (using stupid code duplication) x 35,834 ops/sec ±0.16% (96 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (using stupid code duplication) x 22,068 ops/sec ±0.31% (94 runs sampled)
        oo24LLL v0.0.3 : Downgraded (using stupid code duplication) x 250,769 ops/sec ±0.19% (98 runs sampled)
Fastest is JavaScript (using loops)
24' num x50
        JavaScript (using loops) x 1,402,855 ops/sec ±0.79% (94 runs sampled)
        JavaScript (using recursion) x 41.27 ops/sec ±0.10% (55 runs sampled)
        oo24LLL v0.0.1 : Prototype (using stupid code duplication) x 711 ops/sec ±0.75% (94 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (using stupid code duplication) x 446 ops/sec ±0.17% (93 runs sampled)
        oo24LLL v0.0.3 : Downgraded (using stupid code duplication) x 5,165 ops/sec ±0.14% (96 runs sampled)
Fastest is JavaScript (using loops)
39' num x1
        JavaScript (using loops) x 30,106,187 ops/sec ±0.44% (93 runs sampled)
        JavaScript (using recursion) x 1.51 ops/sec ±0.33% (8 runs sampled)
        oo24LLL v0.0.1 : Prototype (using stupid code duplication) x 21,688 ops/sec ±0.69% (94 runs sampled)
        oo24LLL v0.0.2 : NativeBinaryValues (using stupid code duplication) x 13,654 ops/sec ±0.42% (96 runs sampled)
        oo24LLL v0.0.3 : Downgraded (using stupid code duplication) x 172,819 ops/sec ±0.38% (96 runs sampled)
Fastest is JavaScript (using loops)
all benchmarks: 2:43.454 (m:ss.mmm)
*/
