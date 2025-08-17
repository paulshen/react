"use strict";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.transformFixtureInput = exports.parseInput = exports.parseLanguage = void 0;
const core_1 = require("@babel/core");
const BabelParser = __importStar(require("@babel/parser"));
const HermesParser = __importStar(require("hermes-parser"));
const invariant_1 = __importDefault(require("invariant"));
const path_1 = __importDefault(require("path"));
const prettier_1 = __importDefault(require("prettier"));
const SproutTodoFilter_1 = __importDefault(require("./SproutTodoFilter"));
const fixture_utils_1 = require("./fixture-utils");
const shared_runtime_type_provider_1 = require("./sprout/shared-runtime-type-provider");
function parseLanguage(source) {
    return source.indexOf('@flow') !== -1 ? 'flow' : 'typescript';
}
exports.parseLanguage = parseLanguage;
/**
 * Parse react compiler plugin + environment options from test fixture. Note
 * that although this primarily uses `Environment:parseConfigPragma`, it also
 * has test fixture specific (i.e. not applicable to playground) parsing logic.
 */
function makePluginOptions(firstLine, parseConfigPragmaFn, debugIRLogger, EffectEnum, ValueKindEnum, ValueReasonEnum) {
    // TODO(@mofeiZ) rewrite snap fixtures to @validatePreserveExistingMemo:false
    let validatePreserveExistingMemoizationGuarantees = false;
    let target = '19';
    /**
     * Snap currently runs all fixtures without `validatePreserveExistingMemo` as
     * most fixtures are interested in compilation output, not whether the
     * compiler was able to preserve existing memo.
     *
     * TODO: flip the default. `useMemo` is rare in test fixtures -- fixtures that
     * use useMemo should be explicit about whether this flag is enabled
     */
    if (firstLine.includes('@validatePreserveExistingMemoizationGuarantees')) {
        validatePreserveExistingMemoizationGuarantees = true;
    }
    const logs = [];
    const logger = {
        logEvent: firstLine.includes('@loggerTestOnly')
            ? (filename, event) => {
                logs.push({ filename, event });
            }
            : () => { },
        debugLogIRs: debugIRLogger,
    };
    const config = parseConfigPragmaFn(firstLine, { compilationMode: 'all' });
    const options = Object.assign(Object.assign({}, config), { environment: Object.assign(Object.assign({}, config.environment), { moduleTypeProvider: (0, shared_runtime_type_provider_1.makeSharedRuntimeTypeProvider)({
                EffectEnum,
                ValueKindEnum,
                ValueReasonEnum,
            }), assertValidMutableRanges: true, validatePreserveExistingMemoizationGuarantees }), logger, enableReanimatedCheck: false, target });
    return [options, logs];
}
function parseInput(input, filename, language) {
    // Extract the first line to quickly check for custom test directives
    if (language === 'flow') {
        return HermesParser.parse(input, {
            babel: true,
            flow: 'all',
            sourceFilename: filename,
            sourceType: 'module',
            enableExperimentalComponentSyntax: true,
        });
    }
    else {
        return BabelParser.parse(input, {
            sourceFilename: filename,
            plugins: ['typescript', 'jsx'],
            sourceType: 'module',
        });
    }
}
exports.parseInput = parseInput;
function getEvaluatorPresets(language) {
    const presets = [
        {
            plugins: [
                'babel-plugin-fbt',
                'babel-plugin-fbt-runtime',
                'babel-plugin-idx',
            ],
        },
    ];
    presets.push(language === 'typescript'
        ? [
            '@babel/preset-typescript',
            {
                /**
                 * onlyRemoveTypeImports needs to be set as fbt imports
                 * would otherwise be removed by this pass.
                 * https://github.com/facebook/fbt/issues/49
                 * https://github.com/facebook/sfbt/issues/72
                 * https://dev.to/retyui/how-to-add-support-typescript-for-fbt-an-internationalization-framework-3lo0
                 */
                onlyRemoveTypeImports: true,
            },
        ]
        : '@babel/preset-flow');
    presets.push({
        plugins: ['@babel/plugin-syntax-jsx'],
    });
    presets.push(['@babel/preset-react', { throwIfNamespace: false }], {
        plugins: ['@babel/plugin-transform-modules-commonjs'],
    }, {
        plugins: [
            function BabelPluginRewriteRequirePath() {
                return {
                    visitor: {
                        CallExpression(path) {
                            const { callee } = path.node;
                            if (callee.type === 'Identifier' && callee.name === 'require') {
                                const arg = path.node.arguments[0];
                                if (arg.type === 'StringLiteral') {
                                    // rewrite to use relative import as eval happens in
                                    // sprout/evaluator.ts
                                    if (arg.value === 'shared-runtime') {
                                        arg.value = './shared-runtime';
                                    }
                                    else if (arg.value === 'ReactForgetFeatureFlag') {
                                        arg.value = './ReactForgetFeatureFlag';
                                    }
                                    else if (arg.value === 'useEffectWrapper') {
                                        arg.value = './useEffectWrapper';
                                    }
                                }
                            }
                        },
                    },
                };
            },
        ],
    });
    return presets;
}
function format(inputCode, language) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prettier_1.default.format(inputCode, {
            semi: true,
            parser: language === 'typescript' ? 'babel-ts' : 'flow',
        });
    });
}
const TypescriptEvaluatorPresets = getEvaluatorPresets('typescript');
const FlowEvaluatorPresets = getEvaluatorPresets('flow');
function transformFixtureInput(input, fixturePath, parseConfigPragmaFn, plugin, includeEvaluator, debugIRLogger, EffectEnum, ValueKindEnum, ValueReasonEnum) {
    return __awaiter(this, void 0, void 0, function* () {
        // Extract the first line to quickly check for custom test directives
        const firstLine = input.substring(0, input.indexOf('\n'));
        const language = parseLanguage(firstLine);
        // Preserve file extension as it determines typescript's babel transform
        // mode (e.g. stripping types, parsing rules for brackets)
        const filename = path_1.default.basename(fixturePath) + (language === 'typescript' ? '.ts' : '');
        const inputAst = parseInput(input, filename, language);
        // Give babel transforms an absolute path as relative paths get prefixed
        // with `cwd`, which is different across machines
        const virtualFilepath = '/' + filename;
        const presets = language === 'typescript'
            ? TypescriptEvaluatorPresets
            : FlowEvaluatorPresets;
        /**
         * Get Forget compiled code
         */
        const [options, logs] = makePluginOptions(firstLine, parseConfigPragmaFn, debugIRLogger, EffectEnum, ValueKindEnum, ValueReasonEnum);
        const forgetResult = (0, core_1.transformFromAstSync)(inputAst, input, {
            filename: virtualFilepath,
            highlightCode: false,
            retainLines: true,
            compact: true,
            plugins: [
                [plugin, options],
                'babel-plugin-fbt',
                'babel-plugin-fbt-runtime',
                'babel-plugin-idx',
            ],
            sourceType: 'module',
            ast: includeEvaluator,
            cloneInputAst: includeEvaluator,
            configFile: false,
            babelrc: false,
        });
        (0, invariant_1.default)((forgetResult === null || forgetResult === void 0 ? void 0 : forgetResult.code) != null, 'Expected BabelPluginReactForget to codegen successfully.');
        const forgetCode = forgetResult.code;
        let evaluatorCode = null;
        if (includeEvaluator &&
            !SproutTodoFilter_1.default.has(fixturePath) &&
            !(0, fixture_utils_1.isExpectError)(filename)) {
            let forgetEval;
            try {
                (0, invariant_1.default)((forgetResult === null || forgetResult === void 0 ? void 0 : forgetResult.ast) != null, 'Expected BabelPluginReactForget ast.');
                const result = (0, core_1.transformFromAstSync)(forgetResult.ast, forgetCode, {
                    presets,
                    filename: virtualFilepath,
                    configFile: false,
                    babelrc: false,
                });
                if ((result === null || result === void 0 ? void 0 : result.code) == null) {
                    return {
                        kind: 'err',
                        msg: 'Unexpected error in forget transform pipeline - no code emitted',
                    };
                }
                else {
                    forgetEval = result.code;
                }
            }
            catch (e) {
                return {
                    kind: 'err',
                    msg: 'Unexpected error in Forget transform pipeline: ' + e.message,
                };
            }
            /**
             * Get evaluator code for source (no Forget)
             */
            let originalEval;
            try {
                const result = (0, core_1.transformFromAstSync)(inputAst, input, {
                    presets,
                    filename: virtualFilepath,
                    configFile: false,
                    babelrc: false,
                });
                if ((result === null || result === void 0 ? void 0 : result.code) == null) {
                    return {
                        kind: 'err',
                        msg: 'Unexpected error in non-forget transform pipeline - no code emitted',
                    };
                }
                else {
                    originalEval = result.code;
                }
            }
            catch (e) {
                return {
                    kind: 'err',
                    msg: 'Unexpected error in non-forget transform pipeline: ' + e.message,
                };
            }
            evaluatorCode = {
                forget: forgetEval,
                original: originalEval,
            };
        }
        const forgetOutput = yield format(forgetCode, language);
        let formattedLogs = null;
        if (logs.length !== 0) {
            formattedLogs = logs
                .map(({ event }) => {
                return JSON.stringify(event);
            })
                .join('\n');
        }
        return {
            kind: 'ok',
            value: {
                forgetOutput,
                logs: formattedLogs,
                evaluatorCode,
            },
        };
    });
}
exports.transformFixtureInput = transformFixtureInput;
//# sourceMappingURL=compiler.js.map