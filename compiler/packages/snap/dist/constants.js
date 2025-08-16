"use strict";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILTER_PATH = exports.FILTER_FILENAME = exports.SNAPSHOT_EXTENSION = exports.FIXTURES_PATH = exports.PARSE_CONFIG_PRAGMA_IMPORT = exports.PRINT_REACTIVE_IR_IMPORT = exports.PRINT_HIR_IMPORT = exports.PROJECT_SRC = exports.PROJECT_ROOT = void 0;
const path_1 = __importDefault(require("path"));
// We assume this is run from `babel-plugin-react-compiler`
exports.PROJECT_ROOT = path_1.default.normalize(path_1.default.join(process.cwd(), '..', 'babel-plugin-react-compiler'));
exports.PROJECT_SRC = path_1.default.normalize(path_1.default.join(exports.PROJECT_ROOT, 'dist', 'index.js'));
exports.PRINT_HIR_IMPORT = 'printFunctionWithOutlined';
exports.PRINT_REACTIVE_IR_IMPORT = 'printReactiveFunction';
exports.PARSE_CONFIG_PRAGMA_IMPORT = 'parseConfigPragmaForTests';
exports.FIXTURES_PATH = path_1.default.join(exports.PROJECT_ROOT, 'src', '__tests__', 'fixtures', 'compiler');
exports.SNAPSHOT_EXTENSION = '.expect.md';
exports.FILTER_FILENAME = 'testfilter.txt';
exports.FILTER_PATH = path_1.default.join(exports.PROJECT_ROOT, exports.FILTER_FILENAME);
//# sourceMappingURL=constants.js.map