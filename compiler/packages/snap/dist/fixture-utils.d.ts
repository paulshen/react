/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export type TestFilter = {
    debug: boolean;
    paths: Array<string>;
};
export declare function readTestFilter(): Promise<TestFilter | null>;
export declare function getBasename(fixture: TestFixture): string;
export declare function isExpectError(fixture: TestFixture | string): boolean;
export type TestFixture = {
    fixturePath: string;
    input: string | null;
    inputPath: string;
    snapshot: string | null;
    snapshotPath: string;
} | {
    fixturePath: string;
    input: null;
    inputPath: string;
    snapshot: string;
    snapshotPath: string;
};
export declare function getFixtures(filter: TestFilter | null): Promise<Map<string, TestFixture>>;
