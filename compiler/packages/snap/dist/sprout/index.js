"use strict";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSprout = void 0;
const evaluator_1 = require("./evaluator");
function stringify(result) {
    return `(kind: ${result.kind}) ${result.value}${result.logs.length > 0 ? `\nlogs: [${result.logs.toString()}]` : ''}`;
}
function makeError(description, value) {
    return {
        kind: 'invalid',
        value: description + '\n' + value,
    };
}
function logsEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((val, idx) => val === b[idx]);
}
function runSprout(originalCode, forgetCode) {
    let forgetResult;
    try {
        globalThis.__SNAP_EVALUATOR_MODE = 'forget';
        forgetResult = (0, evaluator_1.doEval)(forgetCode);
    }
    catch (e) {
        throw e;
    }
    finally {
        globalThis.__SNAP_EVALUATOR_MODE = undefined;
    }
    if (forgetResult.kind === 'UnexpectedError') {
        return makeError('Unexpected error in Forget runner', forgetResult.value);
    }
    if (originalCode.indexOf('@disableNonForgetInSprout') === -1) {
        const nonForgetResult = (0, evaluator_1.doEval)(originalCode);
        if (nonForgetResult.kind === 'UnexpectedError') {
            return makeError('Unexpected error in non-forget runner', nonForgetResult.value);
        }
        else if (forgetResult.kind !== nonForgetResult.kind ||
            forgetResult.value !== nonForgetResult.value ||
            !logsEqual(forgetResult.logs, nonForgetResult.logs)) {
            return makeError('Found differences in evaluator results', `Non-forget (expected):
${stringify(nonForgetResult)}
Forget:
${stringify(forgetResult)}
`);
        }
    }
    return {
        kind: 'success',
        value: stringify(forgetResult),
    };
}
exports.runSprout = runSprout;
//# sourceMappingURL=index.js.map