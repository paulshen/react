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
exports.makeWatchRunner = exports.RunnerAction = exports.watchSrc = void 0;
const watcher_1 = __importDefault(require("@parcel/watcher"));
const path_1 = __importDefault(require("path"));
const typescript_1 = __importDefault(require("typescript"));
const constants_1 = require("./constants");
const fixture_utils_1 = require("./fixture-utils");
const child_process_1 = require("child_process");
function watchSrc(onStart, onComplete) {
    const configPath = typescript_1.default.findConfigFile(
    /*searchPath*/ constants_1.PROJECT_ROOT, typescript_1.default.sys.fileExists, 'tsconfig.json');
    if (!configPath) {
        throw new Error("Could not find a valid 'tsconfig.json'.");
    }
    const createProgram = typescript_1.default.createSemanticDiagnosticsBuilderProgram;
    const host = typescript_1.default.createWatchCompilerHost(configPath, undefined, typescript_1.default.sys, createProgram, () => { }, // we manually report errors in afterProgramCreate
    () => { });
    const origCreateProgram = host.createProgram;
    host.createProgram = (rootNames, options, host, oldProgram) => {
        onStart();
        return origCreateProgram(rootNames, options, host, oldProgram);
    };
    host.afterProgramCreate = program => {
        /**
         * Avoid calling original postProgramCreate because it always emits tsc
         * compilation output
         */
        // syntactic diagnostics refer to javascript syntax
        const errors = program
            .getSyntacticDiagnostics()
            .filter(diag => diag.category === typescript_1.default.DiagnosticCategory.Error);
        // semantic diagnostics refer to typescript semantics
        errors.push(...program
            .getSemanticDiagnostics()
            .filter(diag => diag.category === typescript_1.default.DiagnosticCategory.Error));
        if (errors.length > 0) {
            for (const diagnostic of errors) {
                let fileLoc;
                if (diagnostic.file) {
                    // https://github.com/microsoft/TypeScript/blob/ddd5084659c423f4003d2176e12d879b6a5bcf30/src/compiler/program.ts#L663-L674
                    const { line, character } = typescript_1.default.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
                    const fileName = path_1.default.relative(typescript_1.default.sys.getCurrentDirectory(), diagnostic.file.fileName);
                    fileLoc = `${fileName}:${line + 1}:${character + 1} - `;
                }
                else {
                    fileLoc = '';
                }
                console.error(`${fileLoc}error TS${diagnostic.code}:`, typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
            }
            console.error(`Compilation failed (${errors.length} ${errors.length > 1 ? 'errors' : 'error'}).\n`);
        }
        const isSuccess = errors.length === 0;
        onComplete(isSuccess);
    };
    // `createWatchProgram` creates an initial program, watches files, and updates
    // the program over time.
    return typescript_1.default.createWatchProgram(host);
}
exports.watchSrc = watchSrc;
/**
 * Watch mode helpers
 */
var RunnerAction;
(function (RunnerAction) {
    RunnerAction["Test"] = "Test";
    RunnerAction["Update"] = "Update";
})(RunnerAction || (exports.RunnerAction = RunnerAction = {}));
function subscribeFixtures(state, onChange) {
    // Watch the fixtures directory for changes
    watcher_1.default.subscribe(constants_1.FIXTURES_PATH, (err, _events) => __awaiter(this, void 0, void 0, function* () {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        // Try to ignore changes that occurred as a result of our explicitly updating
        // fixtures in update().
        // Currently keeps a timestamp of last known changes, and ignore events that occurred
        // around that timestamp.
        const isRealUpdate = performance.now() - state.lastUpdate > 5000;
        if (isRealUpdate) {
            // Fixtures changed, re-run tests
            state.mode.action = RunnerAction.Test;
            onChange(state);
        }
    }));
}
function subscribeFilterFile(state, onChange) {
    watcher_1.default.subscribe(constants_1.PROJECT_ROOT, (err, events) => __awaiter(this, void 0, void 0, function* () {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        else if (events.findIndex(event => event.path.includes(constants_1.FILTER_FILENAME)) !== -1) {
            if (state.mode.filter) {
                state.filter = yield (0, fixture_utils_1.readTestFilter)();
                state.mode.action = RunnerAction.Test;
                onChange(state);
            }
        }
    }));
}
function subscribeTsc(state, onChange) {
    // Run TS in incremental watch mode
    watchSrc(function onStart() {
        // Notify the user when compilation starts but don't clear the screen yet
        console.log('\nCompiling...');
    }, isTypecheckSuccess => {
        let isCompilerBuildValid = false;
        if (isTypecheckSuccess) {
            try {
                (0, child_process_1.execSync)('yarn build', { cwd: constants_1.PROJECT_ROOT });
                console.log('Built compiler successfully with tsup');
                isCompilerBuildValid = true;
            }
            catch (e) {
                console.warn('Failed to build compiler with tsup:', e);
            }
        }
        // Bump the compiler version after a build finishes
        // and re-run tests
        if (isCompilerBuildValid) {
            state.compilerVersion++;
        }
        state.isCompilerBuildValid = isCompilerBuildValid;
        state.mode.action = RunnerAction.Test;
        onChange(state);
    });
}
function subscribeKeyEvents(state, onChange) {
    process.stdin.on('keypress', (str, key) => __awaiter(this, void 0, void 0, function* () {
        if (key.name === 'u') {
            // u => update fixtures
            state.mode.action = RunnerAction.Update;
        }
        else if (key.name === 'q') {
            process.exit(0);
        }
        else if (key.name === 'f') {
            state.mode.filter = !state.mode.filter;
            state.filter = state.mode.filter ? yield (0, fixture_utils_1.readTestFilter)() : null;
            state.mode.action = RunnerAction.Test;
        }
        else {
            // any other key re-runs tests
            state.mode.action = RunnerAction.Test;
        }
        onChange(state);
    }));
}
function makeWatchRunner(onChange, filterMode) {
    return __awaiter(this, void 0, void 0, function* () {
        const state = {
            compilerVersion: 0,
            isCompilerBuildValid: false,
            lastUpdate: -1,
            mode: {
                action: RunnerAction.Test,
                filter: filterMode,
            },
            filter: filterMode ? yield (0, fixture_utils_1.readTestFilter)() : null,
        };
        subscribeTsc(state, onChange);
        subscribeFixtures(state, onChange);
        subscribeKeyEvents(state, onChange);
        subscribeFilterFile(state, onChange);
    });
}
exports.makeWatchRunner = makeWatchRunner;
//# sourceMappingURL=runner-watch.js.map