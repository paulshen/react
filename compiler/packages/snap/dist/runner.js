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
exports.main = void 0;
const jest_worker_1 = require("jest-worker");
const os_1 = require("os");
const process_1 = __importDefault(require("process"));
const readline = __importStar(require("readline"));
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const constants_1 = require("./constants");
const fixture_utils_1 = require("./fixture-utils");
const reporter_1 = require("./reporter");
const runner_watch_1 = require("./runner-watch");
const runnerWorker = __importStar(require("./runner-worker"));
const child_process_1 = require("child_process");
const WORKER_PATH = require.resolve('./runner-worker.js');
const NUM_WORKERS = (0, os_1.cpus)().length - 1;
readline.emitKeypressEvents(process_1.default.stdin);
const opts = yargs_1.default
    .boolean('sync')
    .describe('sync', 'Run compiler in main thread (instead of using worker threads or subprocesses). Defaults to false.')
    .default('sync', false)
    .boolean('worker-threads')
    .describe('worker-threads', 'Run compiler in worker threads (instead of subprocesses). Defaults to true.')
    .default('worker-threads', true)
    .boolean('watch')
    .describe('watch', 'Run compiler in watch mode, re-running after changes')
    .default('watch', false)
    .boolean('update')
    .describe('update', 'Update fixtures')
    .default('update', false)
    .boolean('filter')
    .describe('filter', 'Only run fixtures which match the contents of testfilter.txt')
    .default('filter', false)
    .help('help')
    .strict()
    .parseSync((0, helpers_1.hideBin)(process_1.default.argv));
/**
 * Do a test run and return the test results
 */
function runFixtures(worker, filter, compilerVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // We could in theory be fancy about tracking the contents of the fixtures
        // directory via our file subscription, but it's simpler to just re-read
        // the directory each time.
        const fixtures = yield (0, fixture_utils_1.getFixtures)(filter);
        const isOnlyFixture = filter !== null && fixtures.size === 1;
        let entries;
        if (!opts.sync) {
            // Note: promise.all to ensure parallelism when enabled
            const work = [];
            for (const [fixtureName, fixture] of fixtures) {
                work.push(worker
                    .transformFixture(fixture, compilerVersion, ((_a = filter === null || filter === void 0 ? void 0 : filter.debug) !== null && _a !== void 0 ? _a : false) && isOnlyFixture, true)
                    .then(result => [fixtureName, result]));
            }
            entries = yield Promise.all(work);
        }
        else {
            entries = [];
            for (const [fixtureName, fixture] of fixtures) {
                let output = yield runnerWorker.transformFixture(fixture, compilerVersion, ((_b = filter === null || filter === void 0 ? void 0 : filter.debug) !== null && _b !== void 0 ? _b : false) && isOnlyFixture, true);
                entries.push([fixtureName, output]);
            }
        }
        return new Map(entries);
    });
}
// Callback to re-run tests after some change
function onChange(worker, state) {
    return __awaiter(this, void 0, void 0, function* () {
        const { compilerVersion, isCompilerBuildValid, mode, filter } = state;
        if (isCompilerBuildValid) {
            const start = performance.now();
            // console.clear() only works when stdout is connected to a TTY device.
            // we're currently piping stdout (see main.ts), so let's do a 'hack'
            console.log('\u001Bc');
            // we don't clear console after this point, since
            // it may contain debug console logging
            const results = yield runFixtures(worker, mode.filter ? filter : null, compilerVersion);
            const end = performance.now();
            if (mode.action === runner_watch_1.RunnerAction.Update) {
                (0, reporter_1.update)(results);
                state.lastUpdate = end;
            }
            else {
                (0, reporter_1.report)(results);
            }
            console.log(`Completed in ${Math.floor(end - start)} ms`);
        }
        else {
            console.error(`${mode}: Found errors in Forget source code, skipping test fixtures.`);
        }
        console.log('\n' +
            (mode.filter
                ? `Current mode = FILTER, filter test fixtures by "${constants_1.FILTER_PATH}".`
                : 'Current mode = NORMAL, run all test fixtures.') +
            '\nWaiting for input or file changes...\n' +
            'u     - update all fixtures\n' +
            `f     - toggle (turn ${mode.filter ? 'off' : 'on'}) filter mode\n` +
            'q     - quit\n' +
            '[any] - rerun tests\n');
    });
}
/**
 * Runs the compiler in watch or single-execution mode
 */
function main(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const worker = new jest_worker_1.Worker(WORKER_PATH, {
            enableWorkerThreads: opts.workerThreads,
            numWorkers: NUM_WORKERS,
        });
        worker.getStderr().pipe(process_1.default.stderr);
        worker.getStdout().pipe(process_1.default.stdout);
        if (opts.watch) {
            (0, runner_watch_1.makeWatchRunner)(state => onChange(worker, state), opts.filter);
            if (opts.filter) {
                /**
                 * Warm up wormers when in watch mode. Loading the Forget babel plugin
                 * and all of its transitive dependencies takes 1-3s (per worker) on a M1.
                 * As jest-worker dispatches tasks using a round-robin strategy, we can
                 * avoid an additional 1-3s wait on the first num_workers runs by warming
                 * up workers eagerly.
                 */
                for (let i = 0; i < NUM_WORKERS - 1; i++) {
                    worker.transformFixture({
                        fixturePath: 'tmp',
                        snapshotPath: './tmp.expect.md',
                        inputPath: './tmp.js',
                        input: `
            function Foo(props) {
              return identity(props);
            }
            `,
                        snapshot: null,
                    }, 0, false, false);
                }
            }
        }
        else {
            // Non-watch mode. For simplicity we re-use the same watchSrc() function.
            // After the first build completes run tests and exit
            const tsWatch = (0, runner_watch_1.watchSrc)(() => { }, (isTypecheckSuccess) => __awaiter(this, void 0, void 0, function* () {
                let isSuccess = false;
                if (!isTypecheckSuccess) {
                    console.error('Found typescript errors in Forget source code, skipping test fixtures.');
                }
                else {
                    try {
                        (0, child_process_1.execSync)('yarn build', { cwd: constants_1.PROJECT_ROOT });
                        console.log('Built compiler successfully with tsup');
                        const testFilter = opts.filter ? yield (0, fixture_utils_1.readTestFilter)() : null;
                        const results = yield runFixtures(worker, testFilter, 0);
                        if (opts.update) {
                            (0, reporter_1.update)(results);
                            isSuccess = true;
                        }
                        else {
                            isSuccess = (0, reporter_1.report)(results);
                        }
                    }
                    catch (e) {
                        console.warn('Failed to build compiler with tsup:', e);
                    }
                }
                tsWatch === null || tsWatch === void 0 ? void 0 : tsWatch.close();
                yield worker.end();
                process_1.default.exit(isSuccess ? 0 : 1);
            }));
        }
    });
}
exports.main = main;
main(opts).catch(error => console.error(error));
//# sourceMappingURL=runner.js.map