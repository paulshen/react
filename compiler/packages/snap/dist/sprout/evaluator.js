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
exports.doEval = void 0;
const react_1 = require("@testing-library/react");
const jsdom_1 = require("jsdom");
const react_2 = __importDefault(require("react"));
const util_1 = __importDefault(require("util"));
const zod_1 = require("zod");
const zod_validation_error_1 = require("zod-validation-error");
const shared_runtime_1 = require("./shared-runtime");
/**
 * Set up the global environment for JSDOM tests.
 * This is a hack to let us share code and setup between the test
 * and runner environments. As an alternative, we could evaluate all setup
 * in the jsdom test environment (which provides more isolation), but that
 * may be slower.
 */
const { window: testWindow } = new jsdom_1.JSDOM(undefined);
globalThis.document = testWindow.document;
globalThis.window = testWindow.window;
globalThis.React = react_2.default;
globalThis.render = react_1.render;
(0, shared_runtime_1.initFbt)();
globalThis.placeholderFn = function (..._args) {
    throw new Error('Fixture not implemented!');
};
/**
 * Define types and schemas for fixture entrypoint
 */
const EntrypointSchema = zod_1.z.strictObject({
    fn: zod_1.z.union([zod_1.z.function(), zod_1.z.object({})]),
    params: zod_1.z.array(zod_1.z.any()),
    // DEPRECATED, unused
    isComponent: zod_1.z.optional(zod_1.z.boolean()),
    // if enabled, the `fn` is assumed to be a component and this is assumed
    // to be an array of props. the component is mounted once and rendered
    // once per set of props in this array.
    sequentialRenders: zod_1.z.optional(zod_1.z.nullable(zod_1.z.array(zod_1.z.any()))).default(null),
});
const ExportSchema = zod_1.z.object({
    FIXTURE_ENTRYPOINT: EntrypointSchema,
});
const NO_ERROR_SENTINEL = Symbol();
/**
 * Wraps WrapperTestComponent in an error boundary to simplify re-rendering
 * when an exception is thrown.
 * A simpler alternative may be to re-mount test components manually.
 */
class WrapperTestComponentWithErrorBoundary extends react_2.default.Component {
    // lastProps: object | null;
    constructor(props) {
        super(props);
        this.lastProps = null;
        this.propsErrorMap = new Map();
        this.state = {
            errorFromLastRender: NO_ERROR_SENTINEL,
        };
    }
    static getDerivedStateFromError(error) {
        // Reschedule a second render that immediately returns the cached error
        return { errorFromLastRender: error };
    }
    componentDidUpdate() {
        if (this.state.errorFromLastRender !== NO_ERROR_SENTINEL) {
            // Reschedule a third render that immediately returns the cached error
            this.setState({ errorFromLastRender: NO_ERROR_SENTINEL });
        }
    }
    render() {
        var _a;
        if (this.state.errorFromLastRender !== NO_ERROR_SENTINEL &&
            this.props === this.lastProps) {
            /**
             * The last render errored, cache the error message to avoid running the
             * test fixture more than once
             */
            const errorMsg = `[[ (exception in render) ${(_a = this.state.errorFromLastRender) === null || _a === void 0 ? void 0 : _a.toString()} ]]`;
            this.propsErrorMap.set(this.lastProps, errorMsg);
            return errorMsg;
        }
        this.lastProps = this.props;
        const cachedError = this.propsErrorMap.get(this.props);
        if (cachedError != null) {
            return cachedError;
        }
        return react_2.default.createElement(WrapperTestComponent, this.props);
    }
}
function WrapperTestComponent(props) {
    const result = props.fn(...props.params);
    // Hacky solution to determine whether the fixture returned jsx (which
    // needs to passed through to React's runtime as-is) or a non-jsx value
    // (which should be converted to a string).
    if (typeof result === 'object' && result != null && '$$typeof' in result) {
        return result;
    }
    else {
        return (0, shared_runtime_1.toJSON)(result);
    }
}
function renderComponentSequentiallyForEachProps(fn, sequentialRenders) {
    if (sequentialRenders.length === 0) {
        throw new Error('Expected at least one set of props when using `sequentialRenders`');
    }
    const initialProps = sequentialRenders[0];
    const results = [];
    const { rerender, container } = (0, react_1.render)(react_2.default.createElement(WrapperTestComponentWithErrorBoundary, {
        fn,
        params: [initialProps],
    }));
    results.push(container.innerHTML);
    for (let i = 1; i < sequentialRenders.length; i++) {
        rerender(react_2.default.createElement(WrapperTestComponentWithErrorBoundary, {
            fn,
            params: [sequentialRenders[i]],
        }));
        results.push(container.innerHTML);
    }
    return results.join('\n');
}
globalThis.evaluateFixtureExport = function (exports) {
    const parsedExportResult = ExportSchema.safeParse(exports);
    if (!parsedExportResult.success) {
        const exportDetail = typeof exports === 'object' && exports != null
            ? `object ${util_1.default.inspect(exports)}`
            : `${exports}`;
        return {
            kind: 'UnexpectedError',
            value: `${(0, zod_validation_error_1.fromZodError)(parsedExportResult.error)}\nFound ` + exportDetail,
        };
    }
    const entrypoint = parsedExportResult.data.FIXTURE_ENTRYPOINT;
    if (entrypoint.sequentialRenders !== null) {
        const result = renderComponentSequentiallyForEachProps(entrypoint.fn, entrypoint.sequentialRenders);
        return {
            kind: 'ok',
            value: result !== null && result !== void 0 ? result : 'null',
        };
    }
    else if (typeof entrypoint.fn === 'object') {
        // Try to run fixture as a react component. This is necessary because not
        // all components are functions (some are ForwardRef or Memo objects).
        const result = (0, react_1.render)(react_2.default.createElement(entrypoint.fn, entrypoint.params[0])).container.innerHTML;
        return {
            kind: 'ok',
            value: result !== null && result !== void 0 ? result : 'null',
        };
    }
    else {
        const result = (0, react_1.render)(react_2.default.createElement(WrapperTestComponent, entrypoint))
            .container.innerHTML;
        return {
            kind: 'ok',
            value: result !== null && result !== void 0 ? result : 'null',
        };
    }
};
function doEval(source) {
    'use strict';
    const originalConsole = globalThis.console;
    const logs = [];
    const mockedLog = (...args) => {
        logs.push(`${args.map(arg => {
            if (arg instanceof Error) {
                return arg.toString();
            }
            else {
                return util_1.default.inspect(arg);
            }
        })}`);
    };
    globalThis.console = {
        info: mockedLog,
        log: mockedLog,
        warn: mockedLog,
        error: (...args) => {
            var _a, _b;
            if (typeof args[0] === 'string' &&
                args[0].includes('ReactDOMTestUtils.act` is deprecated')) {
                // remove this once @testing-library/react is upgraded to React 19.
                return;
            }
            const stack = (_b = (_a = new Error().stack) === null || _a === void 0 ? void 0 : _a.split('\n', 5)) !== null && _b !== void 0 ? _b : [];
            for (const stackFrame of stack) {
                // React warns on exceptions thrown during render, we avoid printing
                // here to reduce noise in test fixture outputs.
                if ((stackFrame.includes('at logCaughtError') &&
                    stackFrame.includes('react-dom-client.development.js')) ||
                    (stackFrame.includes('at defaultOnRecoverableError') &&
                        stackFrame.includes('react-dom-client.development.js'))) {
                    return;
                }
            }
            mockedLog(...args);
        },
        table: mockedLog,
        trace: () => { },
    };
    try {
        // source needs to be evaluated in the same scope as invoke
        const evalResult = eval(`
    (() => {
      // Exports should be overwritten by source
      let exports = {
        FIXTURE_ENTRYPOINT: {
          fn: globalThis.placeholderFn,
          params: [],
        },
      };
      let reachedInvoke = false;
      try {
        // run in an iife to avoid naming collisions
        (() => {${source}})();
        reachedInvoke = true;
        if (exports.FIXTURE_ENTRYPOINT?.fn === globalThis.placeholderFn) {
          return {
            kind: "exception",
            value: "Fixture not implemented",
          };
        }
        return evaluateFixtureExport(exports);
      } catch (e) {
        if (!reachedInvoke) {
          return {
            kind: "UnexpectedError",
            value: e.message,
          };
        } else {
          return {
            kind: "exception",
            value: e.message,
          };
        }
      }
    })()`);
        const result = Object.assign(Object.assign({}, evalResult), { logs });
        return result;
    }
    catch (e) {
        // syntax errors will cause the eval to throw and bubble up here
        return {
            kind: 'UnexpectedError',
            value: 'Unexpected error during eval, possible syntax error?\n' + e.message,
            logs,
        };
    }
    finally {
        globalThis.console = originalConsole;
    }
}
exports.doEval = doEval;
//# sourceMappingURL=evaluator.js.map