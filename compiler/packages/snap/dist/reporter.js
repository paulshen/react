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
exports.report = exports.update = exports.writeOutputToString = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const invariant_1 = __importDefault(require("invariant"));
const jest_diff_1 = require("jest-diff");
const path_1 = __importDefault(require("path"));
function wrapWithTripleBackticks(s, ext = null) {
    return `\`\`\`${ext !== null && ext !== void 0 ? ext : ''}
${s}
\`\`\``;
}
const SPROUT_SEPARATOR = '\n### Eval output\n';
function writeOutputToString(input, compilerOutput, evaluatorOutput, logs, errorMessage) {
    // leading newline intentional
    let result = `
## Input

${wrapWithTripleBackticks(input, 'javascript')}
`; // trailing newline + space internional
    if (compilerOutput != null) {
        result += `
## Code

${wrapWithTripleBackticks(compilerOutput, 'javascript')}
`;
    }
    else {
        result += '\n';
    }
    if (logs != null) {
        result += `
## Logs

${wrapWithTripleBackticks(logs, null)}
`;
    }
    if (errorMessage != null) {
        result += `
## Error

${wrapWithTripleBackticks(errorMessage.replace(/^\/.*?:\s/, ''))}
          \n`;
    }
    result += `      `;
    if (evaluatorOutput != null) {
        result += SPROUT_SEPARATOR + evaluatorOutput;
    }
    return result;
}
exports.writeOutputToString = writeOutputToString;
/**
 * Update the fixtures directory given the compilation results
 */
function update(results) {
    return __awaiter(this, void 0, void 0, function* () {
        let deleted = 0;
        let updated = 0;
        let created = 0;
        const failed = [];
        for (const [basename, result] of results) {
            if (result.unexpectedError != null) {
                console.log(chalk_1.default.red.inverse.bold(' FAILED ') + ' ' + chalk_1.default.dim(basename));
                failed.push([basename, result.unexpectedError]);
            }
            else if (result.actual == null) {
                // Input was deleted but the expect file still existed, remove it
                console.log(chalk_1.default.red.inverse.bold(' REMOVE ') + ' ' + chalk_1.default.dim(basename));
                try {
                    fs_1.default.unlinkSync(result.outputPath);
                    console.log(' remove  ' + result.outputPath);
                    deleted++;
                }
                catch (e) {
                    console.error('[Snap tester error]: failed to remove ' + result.outputPath);
                    failed.push([basename, result.unexpectedError]);
                }
            }
            else if (result.actual !== result.expected) {
                // Expected output has changed
                console.log(chalk_1.default.blue.inverse.bold(' UPDATE ') + ' ' + chalk_1.default.dim(basename));
                try {
                    fs_1.default.writeFileSync(result.outputPath, result.actual, 'utf8');
                }
                catch (e) {
                    if ((e === null || e === void 0 ? void 0 : e.code) === 'ENOENT') {
                        // May have failed to create nested dir, so make a directory and retry
                        fs_1.default.mkdirSync(path_1.default.dirname(result.outputPath), { recursive: true });
                        fs_1.default.writeFileSync(result.outputPath, result.actual, 'utf8');
                    }
                }
                if (result.expected == null) {
                    created++;
                }
                else {
                    updated++;
                }
            }
            else {
                // Expected output is current
                console.log(chalk_1.default.green.inverse.bold('  OKAY  ') + ' ' + chalk_1.default.dim(basename));
            }
        }
        console.log(`${deleted} Deleted, ${created} Created, ${updated} Updated, ${failed.length} Failed`);
        for (const [basename, errorMsg] of failed) {
            console.log(`${chalk_1.default.red.bold('Fail:')} ${basename}\n${errorMsg}`);
        }
    });
}
exports.update = update;
/**
 * Report test results to the user
 * @returns boolean indicatig whether all tests passed
 */
function report(results) {
    const failures = [];
    for (const [basename, result] of results) {
        if (result.actual === result.expected && result.unexpectedError == null) {
            console.log(chalk_1.default.green.inverse.bold(' PASS ') + ' ' + chalk_1.default.dim(basename));
        }
        else {
            console.log(chalk_1.default.red.inverse.bold(' FAIL ') + ' ' + chalk_1.default.dim(basename));
            failures.push([basename, result]);
        }
    }
    if (failures.length !== 0) {
        console.log('\n' + chalk_1.default.red.bold('Failures:') + '\n');
        for (const [basename, result] of failures) {
            console.log(chalk_1.default.red.bold('FAIL:') + ' ' + basename);
            if (result.unexpectedError != null) {
                console.log(` >> Unexpected error during test: \n${result.unexpectedError}`);
            }
            else {
                if (result.expected == null) {
                    (0, invariant_1.default)(result.actual != null, '[Tester] Internal failure.');
                    console.log(chalk_1.default.red('[ expected fixture output is absent ]') + '\n');
                }
                else if (result.actual == null) {
                    (0, invariant_1.default)(result.expected != null, '[Tester] Internal failure.');
                    console.log(chalk_1.default.red(`[ fixture input for ${result.outputPath} is absent ]`) +
                        '\n');
                }
                else {
                    console.log((0, jest_diff_1.diff)(result.expected, result.actual) + '\n');
                }
            }
        }
    }
    console.log(`${results.size} Tests, ${results.size - failures.length} Passed, ${failures.length} Failed`);
    return failures.length === 0;
}
exports.report = report;
//# sourceMappingURL=reporter.js.map