/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ts from 'typescript';
import { TestFilter } from './fixture-utils';
export declare function watchSrc(onStart: () => void, onComplete: (isSuccess: boolean) => void): ts.WatchOfConfigFile<ts.SemanticDiagnosticsBuilderProgram>;
/**
 * Watch mode helpers
 */
export declare enum RunnerAction {
    Test = "Test",
    Update = "Update"
}
type RunnerMode = {
    action: RunnerAction;
    filter: boolean;
};
export type RunnerState = {
    compilerVersion: number;
    isCompilerBuildValid: boolean;
    lastUpdate: number;
    mode: RunnerMode;
    filter: TestFilter | null;
};
export declare function makeWatchRunner(onChange: (state: RunnerState) => void, filterMode: boolean): Promise<void>;
export {};
