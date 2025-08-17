/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Effect, ValueKind, ValueReason } from 'babel-plugin-react-compiler/src';
import type { TypeConfig } from 'babel-plugin-react-compiler/src/HIR/TypeSchema';
export declare function makeSharedRuntimeTypeProvider({ EffectEnum, ValueKindEnum, ValueReasonEnum, }: {
    EffectEnum: typeof Effect;
    ValueKindEnum: typeof ValueKind;
    ValueReasonEnum: typeof ValueReason;
}): (moduleName: string) => TypeConfig | null;
