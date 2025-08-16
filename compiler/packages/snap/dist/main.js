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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const invariant_1 = __importDefault(require("invariant"));
const process_1 = __importDefault(require("process"));
const readline = __importStar(require("readline"));
const helpers_1 = require("yargs/helpers");
readline.emitKeypressEvents(process_1.default.stdin);
if (process_1.default.stdin.isTTY) {
    process_1.default.stdin.setRawMode(true);
}
process_1.default.stdin.on('keypress', function (_, key) {
    if (key && key.name === 'c' && key.ctrl) {
        // handle sigint
        if (childProc) {
            console.log('Interrupted!!');
            childProc.kill('SIGINT');
            childProc.unref();
            process_1.default.exit(-1);
        }
    }
});
const childProc = (0, child_process_1.fork)(require.resolve('./runner.js'), (0, helpers_1.hideBin)(process_1.default.argv), {
    // for some reason, keypress events aren't sent to handlers in both processes
    // when we `inherit` stdin.
    // pipe stdout and stderr so we can silence child process after parent exits
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    // forward existing env variables, like `NODE_OPTIONS` which VSCode uses to attach
    // its debugger
    env: Object.assign(Object.assign({}, process_1.default.env), { FORCE_COLOR: 'true' }),
});
(0, invariant_1.default)(childProc.stdin && childProc.stdout && childProc.stderr, 'Expected forked process to have piped stdio');
process_1.default.stdin.pipe(childProc.stdin);
childProc.stdout.pipe(process_1.default.stdout);
childProc.stderr.pipe(process_1.default.stderr);
childProc.on('exit', code => {
    process_1.default.exit(code !== null && code !== void 0 ? code : -1);
});
//# sourceMappingURL=main.js.map