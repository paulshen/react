/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
type RunnerOptions = {
    sync: boolean;
    workerThreads: boolean;
    watch: boolean;
    filter: boolean;
    update: boolean;
};
/**
 * Runs the compiler in watch or single-execution mode
 */
export declare function main(opts: RunnerOptions): Promise<void>;
export {};
