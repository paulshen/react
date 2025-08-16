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
exports.useSpecialEffect = exports.useFragment = exports.ObjectWithHooks = exports.Builder = exports.toJSON = exports.createHookWrapper = exports.ValidateMemoization = exports.Throw = exports.Stringify = exports.RenderPropAsChild = exports.StaticText2 = exports.StaticText1 = exports.Text = exports.conditionalInvoke = exports.invoke = exports.useIdentity = exports.useNoAlias = exports.useHook = exports.logValue = exports.throwErrorWithMessageIf = exports.throwInput = exports.throwErrorWithMessage = exports.sum = exports.print = exports.addOne = exports.makeArray = exports.makeObject_Primitives = exports.shallowCopy = exports.calculateExpensiveNumber = exports.getFalse = exports.getTrue = exports.getNull = exports.getNumber = exports.identity = exports.graphql = exports.arrayPush = exports.setPropertyByKey = exports.setProperty = exports.mutateAndReturnNewValue = exports.mutateAndReturn = exports.mutate = exports.initFbt = exports.CONST_FALSE = exports.CONST_TRUE = exports.CONST_NUMBER2 = exports.CONST_NUMBER1 = exports.CONST_NUMBER0 = exports.CONST_STRING2 = exports.CONST_STRING1 = exports.CONST_STRING0 = void 0;
exports.typedMutate = exports.typedCreateFrom = exports.typedCapture = exports.typedAlias = exports.typedAssign = exports.typedIdentity = exports.typedLog = exports.typedArrayPush = void 0;
const fbt_1 = require("fbt");
const react_1 = __importDefault(require("react"));
exports.CONST_STRING0 = 'global string 0';
exports.CONST_STRING1 = 'global string 1';
exports.CONST_STRING2 = 'global string 2';
exports.CONST_NUMBER0 = 0;
exports.CONST_NUMBER1 = 1;
exports.CONST_NUMBER2 = 2;
exports.CONST_TRUE = true;
exports.CONST_FALSE = false;
function initFbt() {
    const viewerContext = {
        GENDER: fbt_1.IntlVariations.GENDER_UNKNOWN,
        locale: 'en_US',
    };
    (0, fbt_1.init)({
        translations: {},
        hooks: {
            getViewerContext: () => viewerContext,
        },
    });
}
exports.initFbt = initFbt;
function mutate(arg) {
    // don't mutate primitive
    if (arg == null || typeof arg !== 'object') {
        return;
    }
    else if (Array.isArray(arg)) {
        arg.push('joe');
    }
    let count = 0;
    let key;
    while (true) {
        key = 'wat' + count;
        if (!Object.hasOwn(arg, key)) {
            arg[key] = 'joe';
            return;
        }
        count++;
    }
}
exports.mutate = mutate;
function mutateAndReturn(arg) {
    mutate(arg);
    return arg;
}
exports.mutateAndReturn = mutateAndReturn;
function mutateAndReturnNewValue(arg) {
    mutate(arg);
    return 'hello!';
}
exports.mutateAndReturnNewValue = mutateAndReturnNewValue;
function setProperty(arg, property) {
    // don't mutate primitive
    if (arg == null || typeof arg !== 'object') {
        return arg;
    }
    let count = 0;
    let key;
    while (true) {
        key = 'wat' + count;
        if (!Object.hasOwn(arg, key)) {
            arg[key] = property;
            return arg;
        }
        count++;
    }
}
exports.setProperty = setProperty;
function setPropertyByKey(arg, key, property) {
    arg[key] = property;
    return arg;
}
exports.setPropertyByKey = setPropertyByKey;
function arrayPush(arr, ...values) {
    arr.push(...values);
    return arr;
}
exports.arrayPush = arrayPush;
function graphql(value) {
    return value;
}
exports.graphql = graphql;
function identity(x) {
    return x;
}
exports.identity = identity;
function getNumber() {
    return 4;
}
exports.getNumber = getNumber;
function getNull() {
    return null;
}
exports.getNull = getNull;
function getTrue() {
    return true;
}
exports.getTrue = getTrue;
function getFalse() {
    return false;
}
exports.getFalse = getFalse;
function calculateExpensiveNumber(x) {
    return x;
}
exports.calculateExpensiveNumber = calculateExpensiveNumber;
/**
 * Functions that do not mutate their parameters
 */
function shallowCopy(obj) {
    return Object.assign({}, obj);
}
exports.shallowCopy = shallowCopy;
function makeObject_Primitives() {
    return { a: 0, b: 'value1', c: true };
}
exports.makeObject_Primitives = makeObject_Primitives;
function makeArray(...values) {
    return [...values];
}
exports.makeArray = makeArray;
function addOne(value) {
    return value + 1;
}
exports.addOne = addOne;
/*
 * Alias console.log, as it is defined as a global and may have
 * different compiler handling than unknown functions
 */
function print(...args) {
    console.log(...args);
}
exports.print = print;
function sum(...args) {
    return args.reduce((result, arg) => result + arg, 0);
}
exports.sum = sum;
function throwErrorWithMessage(message) {
    throw new Error(message);
}
exports.throwErrorWithMessage = throwErrorWithMessage;
function throwInput(x) {
    throw x;
}
exports.throwInput = throwInput;
function throwErrorWithMessageIf(cond, message) {
    if (cond) {
        throw new Error(message);
    }
}
exports.throwErrorWithMessageIf = throwErrorWithMessageIf;
function logValue(value) {
    console.log(value);
}
exports.logValue = logValue;
function useHook() {
    return makeObject_Primitives();
}
exports.useHook = useHook;
const noAliasObject = Object.freeze({});
function useNoAlias(..._args) {
    return noAliasObject;
}
exports.useNoAlias = useNoAlias;
function useIdentity(arg) {
    return arg;
}
exports.useIdentity = useIdentity;
function invoke(fn, ...params) {
    return fn(...params);
}
exports.invoke = invoke;
function conditionalInvoke(shouldInvoke, fn, ...params) {
    if (shouldInvoke) {
        return fn(...params);
    }
    else {
        return null;
    }
}
exports.conditionalInvoke = conditionalInvoke;
/**
 * React Components
 */
function Text(props) {
    return react_1.default.createElement('div', null, props.value, props.children);
}
exports.Text = Text;
function StaticText1(props) {
    return react_1.default.createElement('div', null, 'StaticText1', props.children);
}
exports.StaticText1 = StaticText1;
function StaticText2(props) {
    return react_1.default.createElement('div', null, 'StaticText2', props.children);
}
exports.StaticText2 = StaticText2;
function RenderPropAsChild(props) {
    return react_1.default.createElement('div', null, 'HigherOrderComponent', props.items.map(item => item()));
}
exports.RenderPropAsChild = RenderPropAsChild;
function Stringify(props) {
    return react_1.default.createElement('div', null, toJSON(props, props === null || props === void 0 ? void 0 : props.shouldInvokeFns));
}
exports.Stringify = Stringify;
function Throw() {
    throw new Error();
}
exports.Throw = Throw;
function ValidateMemoization({ inputs, output: rawOutput, onlyCheckCompiled = false, }) {
    'use no forget';
    // Wrap rawOutput as it might be a function, which useState would invoke.
    const output = { value: rawOutput };
    const [previousInputs, setPreviousInputs] = react_1.default.useState(inputs);
    const [previousOutput, setPreviousOutput] = react_1.default.useState(output);
    if (!onlyCheckCompiled ||
        (onlyCheckCompiled &&
            globalThis.__SNAP_EVALUATOR_MODE === 'forget')) {
        if (inputs.length !== previousInputs.length ||
            inputs.some((item, i) => item !== previousInputs[i])) {
            // Some input changed, we expect the output to change
            setPreviousInputs(inputs);
            setPreviousOutput(output);
        }
        else if (output.value !== previousOutput.value) {
            // Else output should be stable
            throw new Error('Output identity changed but inputs did not');
        }
    }
    return react_1.default.createElement(Stringify, { inputs, output: rawOutput });
}
exports.ValidateMemoization = ValidateMemoization;
function createHookWrapper(useMaybeHook) {
    return function Component(props) {
        const result = useMaybeHook(props);
        return Stringify({
            result: result,
            shouldInvokeFns: true,
        });
    };
}
exports.createHookWrapper = createHookWrapper;
// helper functions
function toJSON(value, invokeFns = false) {
    const seen = new Map();
    return JSON.stringify(value, (_key, val) => {
        if (typeof val === 'function') {
            if (val.length === 0 && invokeFns) {
                return {
                    kind: 'Function',
                    result: val(),
                };
            }
            else {
                return `[[ function params=${val.length} ]]`;
            }
        }
        else if (typeof val === 'object') {
            let id = seen.get(val);
            if (id != null) {
                return `[[ cyclic ref *${id} ]]`;
            }
            else if (val instanceof Map) {
                return {
                    kind: 'Map',
                    value: Array.from(val.entries()),
                };
            }
            else if (val instanceof Set) {
                return {
                    kind: 'Set',
                    value: Array.from(val.values()),
                };
            }
            seen.set(val, seen.size);
        }
        return val;
    });
}
exports.toJSON = toJSON;
class Builder {
    constructor() {
        this.vals = [];
    }
    static makeBuilder(isNull, ...args) {
        if (isNull) {
            return null;
        }
        else {
            const builder = new Builder();
            builder.push(...args);
            return builder;
        }
    }
    push(...args) {
        this.vals.push(...args);
        return this;
    }
}
exports.Builder = Builder;
exports.ObjectWithHooks = {
    useFoo() {
        return 0;
    },
    useMakeArray() {
        return [1, 2, 3];
    },
    useIdentity(arg) {
        return arg;
    },
};
function useFragment(..._args) {
    return {
        a: [1, 2, 3],
        b: { c: { d: 4 } },
    };
}
exports.useFragment = useFragment;
function useSpecialEffect(fn, _secondArg, deps) {
    react_1.default.useEffect(fn, deps);
}
exports.useSpecialEffect = useSpecialEffect;
function typedArrayPush(array, item) {
    array.push(item);
}
exports.typedArrayPush = typedArrayPush;
function typedLog(...values) {
    console.log(...values);
}
exports.typedLog = typedLog;
function typedIdentity(value) {
    return value;
}
exports.typedIdentity = typedIdentity;
function typedAssign(x) {
    return x;
}
exports.typedAssign = typedAssign;
function typedAlias(x) {
    return x;
}
exports.typedAlias = typedAlias;
function typedCapture(x) {
    return [x];
}
exports.typedCapture = typedCapture;
function typedCreateFrom(array) {
    return array[0];
}
exports.typedCreateFrom = typedCreateFrom;
function typedMutate(x, v = null) {
    x.property = v;
}
exports.typedMutate = typedMutate;
exports.default = typedLog;
//# sourceMappingURL=shared-runtime.js.map