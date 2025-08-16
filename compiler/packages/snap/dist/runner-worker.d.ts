/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { TestFixture } from './fixture-utils';
import { TestResult } from './reporter';
export declare function clearRequireCache(): void;
export declare function transformFixture(fixture: TestFixture, compilerVersion: number, shouldLog: boolean, includeEvaluator: boolean): Promise<TestResult>;
