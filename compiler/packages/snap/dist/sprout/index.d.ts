/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export type SproutResult = {
    kind: 'success';
    value: string;
} | {
    kind: 'invalid';
    value: string;
};
export declare function runSprout(originalCode: string, forgetCode: string): SproutResult;
