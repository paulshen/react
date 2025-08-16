"use strict";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformFixture = exports.clearRequireCache = void 0;
const compiler_1 = require("./compiler");
const constants_1 = require("./constants");
const fixture_utils_1 = require("./fixture-utils");
const reporter_1 = require("./reporter");
const sprout_1 = require("./sprout");
const chalk_1 = __importDefault(require("chalk"));
const originalConsoleError = console.error;
// Try to avoid clearing the entire require cache, which (as of this PR)
// contains ~1250 files. This assumes that no dependencies have global caches
// that may need to be invalidated across Forget reloads.
const invalidationSubpath = 'packages/babel-plugin-react-compiler/dist';
let version = null;
function clearRequireCache() {
    Object.keys(require.cache).forEach(function (path) {
        if (path.includes(invalidationSubpath)) {
            delete require.cache[path];
        }
    });
}
exports.clearRequireCache = clearRequireCache;
function compile(input, fixturePath, compilerVersion, shouldLog, includeEvaluator) {
    return __awaiter(this, void 0, void 0, function* () {
        const seenConsoleErrors = [];
        console.error = (...messages) => {
            seenConsoleErrors.push(...messages);
        };
        if (version !== null && compilerVersion !== version) {
            clearRequireCache();
        }
        version = compilerVersion;
        let compileResult = null;
        let error = null;
        try {
            const importedCompilerPlugin = require(constants_1.PROJECT_SRC);
            // NOTE: we intentionally require lazily here so that we can clear the require cache
            // and load fresh versions of the compiler when `compilerVersion` changes.
            const BabelPluginReactCompiler = importedCompilerPlugin['default'];
            const EffectEnum = importedCompilerPlugin['Effect'];
            const ValueKindEnum = importedCompilerPlugin['ValueKind'];
            const ValueReasonEnum = importedCompilerPlugin['ValueReason'];
            const printFunctionWithOutlined = importedCompilerPlugin[constants_1.PRINT_HIR_IMPORT];
            const printReactiveFunctionWithOutlined = importedCompilerPlugin[constants_1.PRINT_REACTIVE_IR_IMPORT];
            const parseConfigPragmaForTests = importedCompilerPlugin[constants_1.PARSE_CONFIG_PRAGMA_IMPORT];
            let lastLogged = null;
            const debugIRLogger = shouldLog
                ? (value) => {
                    let printed;
                    switch (value.kind) {
                        case 'hir':
                            printed = printFunctionWithOutlined(value.value);
                            break;
                        case 'reactive':
                            printed = printReactiveFunctionWithOutlined(value.value);
                            break;
                        case 'debug':
                            printed = value.value;
                            break;
                        case 'ast':
                            // skip printing ast as we already write fixture output JS
                            printed = '(ast)';
                            break;
                    }
                    if (printed !== lastLogged) {
                        lastLogged = printed;
                        console.log(`${chalk_1.default.green(value.name)}:\n ${printed}\n`);
                    }
                    else {
                        console.log(`${chalk_1.default.blue(value.name)}: (no change)\n`);
                    }
                }
                : () => { };
            // only try logging if we filtered out all but one fixture,
            // since console log order is non-deterministic
            const result = yield (0, compiler_1.transformFixtureInput)(input, fixturePath, parseConfigPragmaForTests, BabelPluginReactCompiler, includeEvaluator, debugIRLogger, EffectEnum, ValueKindEnum, ValueReasonEnum);
            if (result.kind === 'err') {
                error = result.msg;
            }
            else {
                compileResult = result.value;
            }
        }
        catch (e) {
            if (shouldLog) {
                console.error(e.stack);
            }
            error = e.message.replace(/\u001b[^m]*m/g, '');
        }
        // Promote console errors so they can be recorded in fixture output
        for (const consoleError of seenConsoleErrors) {
            if (error != null) {
                error = `${error}\n\n${consoleError}`;
            }
            else {
                error = `ConsoleError: ${consoleError}`;
            }
        }
        console.error = originalConsoleError;
        return {
            error,
            compileResult,
        };
    });
}
function transformFixture(fixture, compilerVersion, shouldLog, includeEvaluator) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { input, snapshot: expected, snapshotPath: outputPath } = fixture;
        const basename = (0, fixture_utils_1.getBasename)(fixture);
        const expectError = (0, fixture_utils_1.isExpectError)(fixture);
        // Input will be null if the input file did not exist, in which case the output file
        // is stale
        if (input === null) {
            return {
                outputPath,
                actual: null,
                expected,
                unexpectedError: null,
            };
        }
        const { compileResult, error } = yield compile(input, fixture.fixturePath, compilerVersion, shouldLog, includeEvaluator);
        let unexpectedError = null;
        if (expectError) {
            if (error === null) {
                unexpectedError = `Expected an error to be thrown for fixture: \`${basename}\`, remove the 'error.' prefix if an error is not expected.`;
            }
        }
        else {
            if (error !== null) {
                unexpectedError = `Expected fixture \`${basename}\` to succeed but it failed with error:\n\n${error}`;
            }
            else if (compileResult == null) {
                unexpectedError = `Expected output for fixture \`${basename}\`.`;
            }
        }
        const snapOutput = (_a = compileResult === null || compileResult === void 0 ? void 0 : compileResult.forgetOutput) !== null && _a !== void 0 ? _a : null;
        let sproutOutput = null;
        if ((compileResult === null || compileResult === void 0 ? void 0 : compileResult.evaluatorCode) != null) {
            const sproutResult = (0, sprout_1.runSprout)(compileResult.evaluatorCode.original, compileResult.evaluatorCode.forget);
            if (sproutResult.kind === 'invalid') {
                unexpectedError !== null && unexpectedError !== void 0 ? unexpectedError : (unexpectedError = '');
                unexpectedError += `\n\n${sproutResult.value}`;
            }
            else {
                sproutOutput = sproutResult.value;
            }
        }
        else if (!includeEvaluator && expected != null) {
            sproutOutput = expected.split('\n### Eval output\n')[1];
        }
        const actualOutput = (0, reporter_1.writeOutputToString)(input, snapOutput, sproutOutput, (_b = compileResult === null || compileResult === void 0 ? void 0 : compileResult.logs) !== null && _b !== void 0 ? _b : null, error);
        return {
            outputPath,
            actual: actualOutput,
            expected,
            unexpectedError,
        };
    });
}
exports.transformFixture = transformFixture;
//# sourceMappingURL=runner-worker.js.map