/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export declare function writeOutputToString(input: string, compilerOutput: string | null, evaluatorOutput: string | null, logs: string | null, errorMessage: string | null): string;
export type TestResult = {
    actual: string | null;
    expected: string | null;
    outputPath: string;
    unexpectedError: string | null;
};
export type TestResults = Map<string, TestResult>;
/**
 * Update the fixtures directory given the compilation results
 */
export declare function update(results: TestResults): Promise<void>;
/**
 * Report test results to the user
 * @returns boolean indicatig whether all tests passed
 */
export declare function report(results: TestResults): boolean;
