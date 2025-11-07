/**
 * Synchronous fp-ts JIT Optimization Benchmark
 *
 * Tests JIT compiler optimizations for fp-ts patterns vs vanilla TypeScript
 * with no async overhead. Focuses on hot path performance.
 *
 * Run with: time node --experimental-strip-types another.ts
 * With GC: time node --expose-gc --experimental-strip-types another.ts
 */

import * as Either from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as Option from 'fp-ts/lib/Option.js';

// ============================================================================
// Measurement Utilities
// ============================================================================

type BenchmarkResult = {
  name: string;
  iterations: number;
  totalTimeMs: number;
  avgTimeNs: number;
  heapUsedMB: number;
  operationsPerSecond: number;
};

function formatMemory(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}

function benchmark(
  name: string,
  iterations: number,
  fn: () => void
): BenchmarkResult {
  // Force GC if available
  if (global.gc) {
    global.gc();
  }

  // Warm-up phase (let JIT optimize)
  const warmupRuns = Math.min(iterations / 10, 10000);
  for (let i = 0; i < warmupRuns; i++) {
    fn();
  }

  // Wait a bit for JIT compilation to settle
  const start = Date.now();
  while (Date.now() - start < 100) {
    // Wait 100ms
  }

  // Force GC again after warmup
  if (global.gc) {
    global.gc();
  }

  const memBefore = process.memoryUsage();
  const startTime = performance.now();

  // Actual benchmark
  for (let i = 0; i < iterations; i++) {
    fn();
  }

  const endTime = performance.now();
  const memAfter = process.memoryUsage();

  const totalTimeMs = endTime - startTime;
  const avgTimeNs = (totalTimeMs * 1_000_000) / iterations;
  const opsPerSecond = Math.round((iterations / totalTimeMs) * 1000);

  return {
    name,
    iterations,
    totalTimeMs: Math.round(totalTimeMs * 100) / 100,
    avgTimeNs: Math.round(avgTimeNs * 100) / 100,
    heapUsedMB: formatMemory(memAfter.heapUsed - memBefore.heapUsed),
    operationsPerSecond: opsPerSecond,
  };
}

function printComparison(
  fptsResult: BenchmarkResult,
  vanillaResult: BenchmarkResult
) {
  const speedOverhead =
    ((fptsResult.avgTimeNs - vanillaResult.avgTimeNs) /
      vanillaResult.avgTimeNs) *
    100;
  const memoryOverhead =
    ((fptsResult.heapUsedMB - vanillaResult.heapUsedMB) /
      Math.abs(vanillaResult.heapUsedMB || 1)) *
    100;
  const speedMultiplier = fptsResult.avgTimeNs / vanillaResult.avgTimeNs;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Benchmark: ${fptsResult.name}`);
  console.log(`Iterations: ${fptsResult.iterations.toLocaleString()}`);
  console.log(`${'─'.repeat(80)}`);
  console.log(
    `fp-ts:    ${fptsResult.totalTimeMs}ms total, ${fptsResult.avgTimeNs.toFixed(2)}ns/op, ${fptsResult.operationsPerSecond.toLocaleString()} ops/sec, ${fptsResult.heapUsedMB}MB`
  );
  console.log(
    `vanilla:  ${vanillaResult.totalTimeMs}ms total, ${vanillaResult.avgTimeNs.toFixed(2)}ns/op, ${vanillaResult.operationsPerSecond.toLocaleString()} ops/sec, ${vanillaResult.heapUsedMB}MB`
  );
  console.log(`${'─'.repeat(80)}`);

  const speedMultiplierText =
    speedMultiplier >= 1
      ? `${speedMultiplier.toFixed(2)}x slower`
      : `${(1 / speedMultiplier).toFixed(2)}x faster`;

  console.log(
    `overhead: ${speedOverhead >= 0 ? '+' : ''}${speedOverhead.toFixed(2)}% time (${speedMultiplierText}), ${memoryOverhead >= 0 ? '+' : ''}${memoryOverhead.toFixed(2)}% memory`
  );

  if (speedOverhead < 0) {
    console.log(
      `🚀 fp-ts is FASTER by ${Math.abs(speedOverhead).toFixed(2)}%!`
    );
  } else if (speedOverhead < 10) {
    console.log(`✅ fp-ts overhead is minimal (< 10%)`);
  } else if (speedOverhead < 50) {
    console.log(`⚠️  fp-ts has moderate overhead`);
  } else {
    console.log(`❌ fp-ts has significant overhead`);
  }
}

// ============================================================================
// Benchmark 1: Either.Do with apS/apSW (Object Construction)
// ============================================================================

type UserData = {
  name: string;
  email: string;
  age: number;
  address: string;
  phone: string;
};

// fp-ts: Using Either.Do with apS pattern
function buildUserData_fpts(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string
): Either.Either<Error, UserData> {
  return pipe(
    Either.Do,
    Either.apS('name', validateName_fpts(name)),
    Either.apSW('email', validateEmail_fpts(email)),
    Either.apSW('age', validateAge_fpts(age)),
    Either.apSW('address', validateAddress_fpts(address)),
    Either.apSW('phone', validatePhone_fpts(phone))
  );
}

function validateName_fpts(name: string): Either.Either<Error, string> {
  return name.length > 0 && name.length < 100
    ? Either.right(name.trim())
    : Either.left(new Error('Invalid name'));
}

function validateEmail_fpts(email: string): Either.Either<Error, string> {
  return email.includes('@') && email.length > 3
    ? Either.right(email.toLowerCase())
    : Either.left(new Error('Invalid email'));
}

function validateAge_fpts(age: number): Either.Either<Error, number> {
  return age >= 0 && age <= 150
    ? Either.right(age)
    : Either.left(new Error('Invalid age'));
}

function validateAddress_fpts(address: string): Either.Either<Error, string> {
  return address.length > 0 && address.length < 500
    ? Either.right(address.trim())
    : Either.left(new Error('Invalid address'));
}

function validatePhone_fpts(phone: string): Either.Either<Error, string> {
  return phone.length >= 10 && phone.length <= 15
    ? Either.right(phone.trim())
    : Either.left(new Error('Invalid phone'));
}

// Vanilla TS equivalent
type Result<T> = { success: true; data: T } | { success: false; error: Error };

function buildUserData_vanilla(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string
): Result<UserData> {
  const validatedName = validateName_vanilla(name);
  if (!validatedName.success) {
    return validatedName;
  }

  const validatedEmail = validateEmail_vanilla(email);
  if (!validatedEmail.success) {
    return validatedEmail;
  }

  const validatedAge = validateAge_vanilla(age);
  if (!validatedAge.success) {
    return validatedAge;
  }

  const validatedAddress = validateAddress_vanilla(address);
  if (!validatedAddress.success) {
    return validatedAddress;
  }

  const validatedPhone = validatePhone_vanilla(phone);
  if (!validatedPhone.success) {
    return validatedPhone;
  }

  return {
    success: true,
    data: {
      name: validatedName.data,
      email: validatedEmail.data,
      age: validatedAge.data,
      address: validatedAddress.data,
      phone: validatedPhone.data,
    },
  };
}

function validateName_vanilla(name: string): Result<string> {
  return name.length > 0 && name.length < 100
    ? { success: true, data: name.trim() }
    : { success: false, error: new Error('Invalid name') };
}

function validateEmail_vanilla(email: string): Result<string> {
  return email.includes('@') && email.length > 3
    ? { success: true, data: email.toLowerCase() }
    : { success: false, error: new Error('Invalid email') };
}

function validateAge_vanilla(age: number): Result<number> {
  return age >= 0 && age <= 150
    ? { success: true, data: age }
    : { success: false, error: new Error('Invalid age') };
}

function validateAddress_vanilla(address: string): Result<string> {
  return address.length > 0 && address.length < 500
    ? { success: true, data: address.trim() }
    : { success: false, error: new Error('Invalid address') };
}

function validatePhone_vanilla(phone: string): Result<string> {
  return phone.length >= 10 && phone.length <= 15
    ? { success: true, data: phone.trim() }
    : { success: false, error: new Error('Invalid phone') };
}

function benchmarkEitherApS(iterations: number) {
  const testData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30,
    address: '123 Main St, City, Country',
    phone: '+1234567890',
  };

  const fptsResult = benchmark('Either.Do with apS/apSW', iterations, () => {
    buildUserData_fpts(
      testData.name,
      testData.email,
      testData.age,
      testData.address,
      testData.phone
    );
  });

  const vanillaResult = benchmark('Either.Do with apS/apSW', iterations, () => {
    buildUserData_vanilla(
      testData.name,
      testData.email,
      testData.age,
      testData.address,
      testData.phone
    );
  });

  printComparison(fptsResult, vanillaResult);
}

// ============================================================================
// Benchmark 2: pipe with Multiple Transformations
// ============================================================================

function processString_fpts(input: string): string {
  return pipe(
    input,
    (str) => str.trim().toLowerCase().replace(/\s+/g, ' ').split(' '),
    (words) => words.filter((word) => word.length > 2),
    (words) =>
      words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)),
    (capitalized) => `processed-${capitalized.join('-')}`.substring(0, 100)
  );
}

function processString_vanilla(input: string): string {
  const words = input.trim().toLowerCase().replace(/\s+/g, ' ').split(' ');

  const capitalized: string[] = [];
  for (const word of words) {
    if (word.length > 2) {
      capitalized.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
  }

  return `processed-${capitalized.join('-')}`.substring(0, 100);
}

function benchmarkPipe(iterations: number) {
  const testInput =
    '  Hello   World  from   TypeScript   functional   programming  ';

  const fptsResult = benchmark('pipe with transformations', iterations, () => {
    processString_fpts(testInput);
  });

  const vanillaResult = benchmark(
    'pipe with transformations',
    iterations,
    () => {
      processString_vanilla(testInput);
    }
  );

  printComparison(fptsResult, vanillaResult);
}

// ============================================================================
// Benchmark 3: Either chain operations
// ============================================================================

function validateAndTransform_fpts(
  value: number
): Either.Either<Error, number> {
  return pipe(
    Either.right(value),
    Either.flatMap((val) =>
      val > 0 ? Either.right(val) : Either.left(new Error('Must be positive'))
    ),
    Either.map((val) => val * 2),
    Either.flatMap((val) =>
      val < 1000 ? Either.right(val) : Either.left(new Error('Value too large'))
    ),
    Either.map((val) => val + 10),
    Either.flatMap((val) =>
      val % 2 === 0 ? Either.right(val) : Either.left(new Error('Must be even'))
    ),
    Either.map((val) => Math.sqrt(val))
  );
}

function validateAndTransform_vanilla(value: number): Result<number> {
  if (value <= 0) {
    return { success: false, error: new Error('Must be positive') };
  }

  const doubled = value * 2;

  if (doubled >= 1000) {
    return { success: false, error: new Error('Value too large') };
  }

  const added = doubled + 10;

  if (added % 2 !== 0) {
    return { success: false, error: new Error('Must be even') };
  }

  return { success: true, data: Math.sqrt(added) };
}

function benchmarkEitherChain(iterations: number) {
  const fptsResult = benchmark('Either chain operations', iterations, () => {
    validateAndTransform_fpts(42);
  });

  const vanillaResult = benchmark('Either chain operations', iterations, () => {
    validateAndTransform_vanilla(42);
  });

  printComparison(fptsResult, vanillaResult);
}

// ============================================================================
// Benchmark 4: Option operations
// ============================================================================

function processOptionalData_fpts(data: {
  name?: string;
  age?: number;
  email?: string;
}): Option.Option<string> {
  return pipe(
    Option.fromNullable(data.name),
    Option.map((name) => name.trim()),
    Option.filter((name) => name.length > 0),
    Option.flatMap((name) =>
      pipe(
        Option.fromNullable(data.age),
        Option.filter((age) => age >= 18),
        Option.map((age) => `${name} (${age})`)
      )
    ),
    Option.flatMap((nameAge) =>
      pipe(
        Option.fromNullable(data.email),
        Option.filter((email) => email.includes('@')),
        Option.map((email) => `${nameAge} - ${email}`)
      )
    )
  );
}

function processOptionalData_vanilla(data: {
  name?: string;
  age?: number;
  email?: string;
}): string | null {
  if (!data.name) {
    return null;
  }

  const trimmedName = data.name.trim();
  if (trimmedName.length === 0) {
    return null;
  }

  if (!data.age || data.age < 18) {
    return null;
  }

  const nameAge = `${trimmedName} (${data.age})`;

  if (!data.email || !data.email.includes('@')) {
    return null;
  }

  return `${nameAge} - ${data.email}`;
}

function benchmarkOption(iterations: number) {
  const testData = {
    name: '  Alice  ',
    age: 25,
    email: 'alice@example.com',
  };

  const fptsResult = benchmark('Option operations', iterations, () => {
    processOptionalData_fpts(testData);
  });

  const vanillaResult = benchmark('Option operations', iterations, () => {
    processOptionalData_vanilla(testData);
  });

  printComparison(fptsResult, vanillaResult);
}

// ============================================================================
// Benchmark 5: Complex nested Either.Do with multiple apS
// ============================================================================

type ComplexData = {
  field1: string;
  field2: number;
  field3: boolean;
  field4: string;
  field5: number;
  field6: string;
  field7: number;
  field8: string;
};

function buildComplexData_fpts(
  f1: string,
  f2: number,
  f3: boolean,
  f4: string,
  f5: number,
  f6: string,
  f7: number,
  f8: string
): Either.Either<Error, ComplexData> {
  return pipe(
    Either.Do,
    Either.apS('field1', Either.right(f1.toUpperCase())),
    Either.apSW(
      'field2',
      f2 > 0 ? Either.right(f2 * 2) : Either.left(new Error('Invalid f2'))
    ),
    Either.apSW('field3', Either.right(!f3)),
    Either.apSW('field4', Either.right(f4.toLowerCase())),
    Either.apSW(
      'field5',
      f5 < 100 ? Either.right(f5 + 10) : Either.left(new Error('Invalid f5'))
    ),
    Either.apSW('field6', Either.right(f6.trim())),
    Either.apSW('field7', Either.right(f7 * 3)),
    Either.apSW('field8', Either.right(f8.substring(0, 10)))
  );
}

function buildComplexData_vanilla(
  f1: string,
  f2: number,
  f3: boolean,
  f4: string,
  f5: number,
  f6: string,
  f7: number,
  f8: string
): Result<ComplexData> {
  if (f2 <= 0) {
    return { success: false, error: new Error('Invalid f2') };
  }

  if (f5 >= 100) {
    return { success: false, error: new Error('Invalid f5') };
  }

  return {
    success: true,
    data: {
      field1: f1.toUpperCase(),
      field2: f2 * 2,
      field3: !f3,
      field4: f4.toLowerCase(),
      field5: f5 + 10,
      field6: f6.trim(),
      field7: f7 * 3,
      field8: f8.substring(0, 10),
    },
  };
}

function benchmarkComplexApS(iterations: number) {
  const fptsResult = benchmark(
    'Complex Either.Do (8 fields)',
    iterations,
    () => {
      buildComplexData_fpts(
        'test',
        42,
        true,
        'DATA',
        50,
        '  value  ',
        10,
        'longstring'
      );
    }
  );

  const vanillaResult = benchmark(
    'Complex Either.Do (8 fields)',
    iterations,
    () => {
      buildComplexData_vanilla(
        'test',
        42,
        true,
        'DATA',
        50,
        '  value  ',
        10,
        'longstring'
      );
    }
  );

  printComparison(fptsResult, vanillaResult);
}

// ============================================================================
// Main Runner
// ============================================================================

function main() {
  console.log('\n');
  console.log(
    '╔════════════════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║         Synchronous fp-ts JIT Optimization Benchmark                      ║'
  );
  console.log(
    '║                                                                            ║'
  );
  console.log(
    '║  Testing JIT compiler optimizations for fp-ts vs vanilla TypeScript       ║'
  );
  console.log(
    '║  Focus: Hot path performance with no async overhead                       ║'
  );
  console.log(
    '╚════════════════════════════════════════════════════════════════════════════╝'
  );
  console.log('\n');

  // Different iteration counts to see JIT optimization effects
  const iterationSets = [
    { label: 'Small (10K)', iterations: 10_000 },
    { label: 'Medium (100K)', iterations: 100_000 },
    { label: 'Large (1M)', iterations: 1_000_000 },
  ];

  for (const { label, iterations } of iterationSets) {
    console.log(`\n\n${'█'.repeat(80)}`);
    console.log(
      `█  ${label} iterations - Testing JIT Optimization`.padEnd(79) + '█'
    );
    console.log(`${'█'.repeat(80)}\n`);

    benchmarkEitherApS(iterations);
    benchmarkPipe(iterations);
    benchmarkEitherChain(iterations);
    benchmarkOption(iterations);
    benchmarkComplexApS(iterations);
  }

  console.log('\n\n' + '═'.repeat(80));
  console.log('Benchmark Complete!');
  console.log('═'.repeat(80));
  console.log('\nKey Insights:');
  console.log(
    '- Lower overhead % with higher iterations = better JIT optimization'
  );
  console.log('- ns/op shows per-operation cost after JIT warmup');
  console.log('- ops/sec shows throughput (higher is better)');
  console.log('\nTo see system-level metrics:');
  console.log('  time node --experimental-strip-types another.ts');
  console.log('\nWith explicit GC for better memory measurements:');
  console.log(
    '  time node --expose-gc --experimental-strip-types another.ts\n'
  );
}

main();
