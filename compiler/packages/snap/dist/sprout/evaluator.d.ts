/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export type EvaluatorResult = {
    kind: 'ok' | 'exception' | 'UnexpectedError';
    value: string;
    logs: Array<string>;
};
export declare function doEval(source: string): EvaluatorResult;
