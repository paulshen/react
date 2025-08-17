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
exports.getFixtures = exports.isExpectError = exports.getBasename = exports.readTestFilter = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const glob = __importStar(require("glob"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const INPUT_EXTENSIONS = [
    '.js',
    '.cjs',
    '.mjs',
    '.ts',
    '.cts',
    '.mts',
    '.jsx',
    '.tsx',
];
function exists(file) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield promises_1.default.access(file);
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
function stripExtension(filename, extensions) {
    for (const ext of extensions) {
        if (filename.endsWith(ext)) {
            return filename.slice(0, -ext.length);
        }
    }
    return filename;
}
function readTestFilter() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield exists(constants_1.FILTER_PATH))) {
            throw new Error(`testfilter file not found at \`${constants_1.FILTER_PATH}\``);
        }
        const input = yield promises_1.default.readFile(constants_1.FILTER_PATH, 'utf8');
        const lines = input.trim().split('\n');
        let debug = false;
        const line0 = lines[0];
        if (line0 != null) {
            // Try to parse pragmas
            let consumedLine0 = false;
            if (line0.indexOf('@only') !== -1) {
                consumedLine0 = true;
            }
            if (line0.indexOf('@debug') !== -1) {
                debug = true;
                consumedLine0 = true;
            }
            if (consumedLine0) {
                lines.shift();
            }
        }
        return {
            debug,
            paths: lines.filter(line => !line.trimStart().startsWith('//')),
        };
    });
}
exports.readTestFilter = readTestFilter;
function getBasename(fixture) {
    return stripExtension(path_1.default.basename(fixture.inputPath), INPUT_EXTENSIONS);
}
exports.getBasename = getBasename;
function isExpectError(fixture) {
    const basename = typeof fixture === 'string' ? fixture : getBasename(fixture);
    return basename.startsWith('error.') || basename.startsWith('todo.error');
}
exports.isExpectError = isExpectError;
function readInputFixtures(rootDir, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        let inputFiles;
        if (filter == null) {
            inputFiles = glob.sync(`**/*{${INPUT_EXTENSIONS.join(',')}}`, {
                cwd: rootDir,
            });
        }
        else {
            inputFiles = (yield Promise.all(filter.paths.map(pattern => glob.glob(`${pattern}{${INPUT_EXTENSIONS.join(',')}}`, {
                cwd: rootDir,
            })))).flat();
        }
        const inputs = [];
        for (const filePath of inputFiles) {
            // Do not include extensions in unique identifier for fixture
            const partialPath = stripExtension(filePath, INPUT_EXTENSIONS);
            inputs.push(promises_1.default.readFile(path_1.default.join(rootDir, filePath), 'utf8').then(input => {
                return [
                    partialPath,
                    {
                        value: input,
                        filepath: filePath,
                    },
                ];
            }));
        }
        return new Map(yield Promise.all(inputs));
    });
}
function readOutputFixtures(rootDir, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        let outputFiles;
        if (filter == null) {
            outputFiles = glob.sync(`**/*${constants_1.SNAPSHOT_EXTENSION}`, {
                cwd: rootDir,
            });
        }
        else {
            outputFiles = (yield Promise.all(filter.paths.map(pattern => glob.glob(`${pattern}${constants_1.SNAPSHOT_EXTENSION}`, {
                cwd: rootDir,
            })))).flat();
        }
        const outputs = [];
        for (const filePath of outputFiles) {
            // Do not include extensions in unique identifier for fixture
            const partialPath = stripExtension(filePath, [constants_1.SNAPSHOT_EXTENSION]);
            const outputPath = path_1.default.join(rootDir, filePath);
            const output = promises_1.default
                .readFile(outputPath, 'utf8')
                .then(output => {
                return [partialPath, output];
            });
            outputs.push(output);
        }
        return new Map(yield Promise.all(outputs));
    });
}
function getFixtures(filter) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const inputs = yield readInputFixtures(constants_1.FIXTURES_PATH, filter);
        const outputs = yield readOutputFixtures(constants_1.FIXTURES_PATH, filter);
        const fixtures = new Map();
        for (const [partialPath, { value, filepath }] of inputs) {
            const output = (_a = outputs.get(partialPath)) !== null && _a !== void 0 ? _a : null;
            fixtures.set(partialPath, {
                fixturePath: partialPath,
                input: value,
                inputPath: filepath,
                snapshot: output,
                snapshotPath: path_1.default.join(constants_1.FIXTURES_PATH, partialPath) + constants_1.SNAPSHOT_EXTENSION,
            });
        }
        for (const [partialPath, output] of outputs) {
            if (!fixtures.has(partialPath)) {
                fixtures.set(partialPath, {
                    fixturePath: partialPath,
                    input: null,
                    inputPath: 'none',
                    snapshot: output,
                    snapshotPath: path_1.default.join(constants_1.FIXTURES_PATH, partialPath) + constants_1.SNAPSHOT_EXTENSION,
                });
            }
        }
        return fixtures;
    });
}
exports.getFixtures = getFixtures;
//# sourceMappingURL=fixture-utils.js.map