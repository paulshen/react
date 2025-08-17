/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as BabelCore from '@babel/core';
import type { CompilerPipelineValue } from 'babel-plugin-react-compiler/src/Entrypoint';
import type { Effect, ValueKind, ValueReason } from 'babel-plugin-react-compiler/src/HIR';
import type { parseConfigPragmaForTests as ParseConfigPragma } from 'babel-plugin-react-compiler/src/Utils/TestUtils';
export declare function parseLanguage(source: string): 'flow' | 'typescript';
export declare function parseInput(input: string, filename: string, language: 'flow' | 'typescript'): BabelCore.types.File;
export type TransformResult = {
    forgetOutput: string;
    logs: string | null;
    evaluatorCode: {
        original: string;
        forget: string;
    } | null;
};
export declare function transformFixtureInput(input: string, fixturePath: string, parseConfigPragmaFn: typeof ParseConfigPragma, plugin: BabelCore.PluginObj, includeEvaluator: boolean, debugIRLogger: (value: CompilerPipelineValue) => void, EffectEnum: typeof Effect, ValueKindEnum: typeof ValueKind, ValueReasonEnum: typeof ValueReason): Promise<{
    kind: 'ok';
    value: TransformResult;
} | {
    kind: 'err';
    msg: string;
}>;
