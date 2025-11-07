# fp-ts-vs-vanilla-ts-v8-jit

This repo benchmark's how node.js V8 engine's JIT performs on `fp-ts` code vs its vanilla TS equivalent.

### How to run

`npm run benchmark`

### Benchmark results from my computer

```
╔════════════════════════════════════════════════════════════════════════════╗
║         Synchronous fp-ts JIT Optimization Benchmark                      ║
║                                                                            ║
║  Testing JIT compiler optimizations for fp-ts vs vanilla TypeScript       ║
║  Focus: Hot path performance with no async overhead                       ║
╚════════════════════════════════════════════════════════════════════════════╝


████████████████████████████████████████████████████████████████████████████████
█  Small (10K) iterations - Testing JIT Optimization                           █
████████████████████████████████████████████████████████████████████████████████


================================================================================
Benchmark: Either.Do with apS/apSW
Iterations: 10,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    4.93ms total, 493.29ns/op, 2,027,198 ops/sec, 0.68MB
vanilla:  1.49ms total, 148.95ns/op, 6,713,852 ops/sec, 0.79MB
────────────────────────────────────────────────────────────────────────────────
overhead: +231.18% time (3.31x slower), -13.92% memory
❌ fp-ts has significant overhead

================================================================================
Benchmark: pipe with transformations
Iterations: 10,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    8.52ms total, 851.80ns/op, 1,173,990 ops/sec, 0.05MB
vanilla:  5.46ms total, 545.52ns/op, 1,833,124 ops/sec, 1.61MB
────────────────────────────────────────────────────────────────────────────────
overhead: +56.14% time (1.56x slower), -96.89% memory
❌ fp-ts has significant overhead

================================================================================
Benchmark: Either chain operations
Iterations: 10,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    9.14ms total, 913.62ns/op, 1,094,541 ops/sec, 0.11MB
vanilla:  0.45ms total, 44.58ns/op, 22,429,873 ops/sec, 0.69MB
────────────────────────────────────────────────────────────────────────────────
overhead: +1949.39% time (20.49x slower), -84.06% memory
❌ fp-ts has significant overhead

================================================================================
Benchmark: Option operations
Iterations: 10,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    7.52ms total, 751.78ns/op, 1,330,170 ops/sec, 0.23MB
vanilla:  0.6ms total, 60.02ns/op, 16,659,725 ops/sec, 0.91MB
────────────────────────────────────────────────────────────────────────────────
overhead: +1152.55% time (12.53x slower), -74.73% memory
❌ fp-ts has significant overhead

================================================================================
Benchmark: Complex Either.Do (8 fields)
Iterations: 10,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    8.71ms total, 871.01ns/op, 1,148,089 ops/sec, 1.2MB
vanilla:  0.82ms total, 82.04ns/op, 12,188,923 ops/sec, 1.5MB
────────────────────────────────────────────────────────────────────────────────
overhead: +961.69% time (10.62x slower), -20.00% memory
❌ fp-ts has significant overhead


████████████████████████████████████████████████████████████████████████████████
█  Medium (100K) iterations - Testing JIT Optimization                         █
████████████████████████████████████████████████████████████████████████████████


================================================================================
Benchmark: Either.Do with apS/apSW
Iterations: 100,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    43.52ms total, 435.22ns/op, 2,297,691 ops/sec, 1.41MB
vanilla:  2.49ms total, 24.92ns/op, 40,135,787 ops/sec, 1.85MB
────────────────────────────────────────────────────────────────────────────────
overhead: +1646.47% time (17.46x slower), -23.78% memory
❌ fp-ts has significant overhead

================================================================================
Benchmark: pipe with transformations
Iterations: 100,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    55.68ms total, 556.77ns/op, 1,796,063 ops/sec, 1.23MB
vanilla:  54.11ms total, 541.14ns/op, 1,847,936 ops/sec, 0.21MB
────────────────────────────────────────────────────────────────────────────────
overhead: +2.89% time (1.03x slower), +485.71% memory
✅ fp-ts overhead is minimal (< 10%)

================================================================================
Benchmark: Either chain operations
Iterations: 100,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    86.97ms total, 869.73ns/op, 1,149,782 ops/sec, 1.11MB
vanilla:  0.43ms total, 4.35ns/op, 229,928,929 ops/sec, 0MB
────────────────────────────────────────────────────────────────────────────────
overhead: +19893.79% time (199.94x slower), +111.00% memory
❌ fp-ts has significant overhead

================================================================================
Benchmark: Option operations
Iterations: 100,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    64.57ms total, 645.69ns/op, 1,548,727 ops/sec, 1.19MB
vanilla:  3.16ms total, 31.62ns/op, 31,620,963 ops/sec, 1.94MB
────────────────────────────────────────────────────────────────────────────────
overhead: +1942.03% time (20.42x slower), -38.66% memory
❌ fp-ts has significant overhead

================================================================================
Benchmark: Complex Either.Do (8 fields)
Iterations: 100,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    79.21ms total, 792.13ns/op, 1,262,423 ops/sec, 0.43MB
vanilla:  2.17ms total, 21.70ns/op, 46,084,712 ops/sec, 0.97MB
────────────────────────────────────────────────────────────────────────────────
overhead: +3550.37% time (36.50x slower), -55.67% memory
❌ fp-ts has significant overhead


████████████████████████████████████████████████████████████████████████████████
█  Large (1M) iterations - Testing JIT Optimization                            █
████████████████████████████████████████████████████████████████████████████████


================================================================================
Benchmark: Either.Do with apS/apSW
Iterations: 1,000,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    403.8ms total, 403.80ns/op, 2,476,487 ops/sec, 1.49MB
vanilla:  24.76ms total, 24.76ns/op, 40,382,353 ops/sec, 2.76MB
────────────────────────────────────────────────────────────────────────────────
overhead: +1530.86% time (16.31x slower), -46.01% memory
❌ fp-ts has significant overhead

================================================================================
Benchmark: pipe with transformations
Iterations: 1,000,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    538.94ms total, 538.94ns/op, 1,855,487 ops/sec, 0.53MB
vanilla:  533.93ms total, 533.93ns/op, 1,872,904 ops/sec, 1.83MB
────────────────────────────────────────────────────────────────────────────────
overhead: +0.94% time (1.01x slower), -71.04% memory
✅ fp-ts overhead is minimal (< 10%)

================================================================================
Benchmark: Either chain operations
Iterations: 1,000,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    833.32ms total, 833.32ns/op, 1,200,014 ops/sec, 2.71MB
vanilla:  3.89ms total, 3.89ns/op, 256,959,293 ops/sec, 0MB
────────────────────────────────────────────────────────────────────────────────
overhead: +21322.11% time (214.22x slower), +271.00% memory
❌ fp-ts has significant overhead

================================================================================
Benchmark: Option operations
Iterations: 1,000,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    615.6ms total, 615.60ns/op, 1,624,441 ops/sec, 3.37MB
vanilla:  30.77ms total, 30.77ns/op, 32,494,435 ops/sec, 3.62MB
────────────────────────────────────────────────────────────────────────────────
overhead: +1900.65% time (20.01x slower), -6.91% memory
❌ fp-ts has significant overhead

================================================================================
Benchmark: Complex Either.Do (8 fields)
Iterations: 1,000,000
────────────────────────────────────────────────────────────────────────────────
fp-ts:    720.71ms total, 720.71ns/op, 1,387,522 ops/sec, 1.25MB
vanilla:  21.14ms total, 21.14ns/op, 47,309,470 ops/sec, 1.82MB
────────────────────────────────────────────────────────────────────────────────
overhead: +3309.22% time (34.09x slower), -31.32% memory
❌ fp-ts has significant overhead


════════════════════════════════════════════════════════════════════════════════
Benchmark Complete!
════════════════════════════════════════════════════════════════════════════════

Key Insights:
- Lower overhead % with higher iterations = better JIT optimization
- ns/op shows per-operation cost after JIT warmup
- ops/sec shows throughput (higher is better)
```
