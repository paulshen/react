/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { FunctionComponent } from 'react';
/**
 * This file is meant for use by `runner-evaluator` and fixture tests.
 *
 * Any fixture test can import constants or functions exported here.
 * However, the import path must be the relative path from `runner-evaluator`
 * (which calls `eval` on each fixture) to this file.
 *
 * ```js
 * // test.js
 * import {CONST_STRING0} from './shared-runtime';
 *
 * // ...
 * ```
 */
export type StringKeyedObject = {
    [key: string]: unknown;
};
export declare const CONST_STRING0 = "global string 0";
export declare const CONST_STRING1 = "global string 1";
export declare const CONST_STRING2 = "global string 2";
export declare const CONST_NUMBER0 = 0;
export declare const CONST_NUMBER1 = 1;
export declare const CONST_NUMBER2 = 2;
export declare const CONST_TRUE = true;
export declare const CONST_FALSE = false;
export declare function initFbt(): void;
export declare function mutate(arg: any): void;
export declare function mutateAndReturn<T>(arg: T): T;
export declare function mutateAndReturnNewValue<T>(arg: T): string;
export declare function setProperty(arg: any, property: any): void;
export declare function setPropertyByKey<T, TKey extends keyof T, TProperty extends T[TKey]>(arg: T, key: TKey, property: TProperty): T;
export declare function arrayPush<T>(arr: Array<T>, ...values: Array<T>): Array<T>;
export declare function graphql(value: string): string;
export declare function identity<T>(x: T): T;
export declare function getNumber(): number;
export declare function getNull(): null;
export declare function getTrue(): true;
export declare function getFalse(): false;
export declare function calculateExpensiveNumber(x: number): number;
/**
 * Functions that do not mutate their parameters
 */
export declare function shallowCopy<T extends object>(obj: T): T;
export declare function makeObject_Primitives(): StringKeyedObject;
export declare function makeArray<T>(...values: Array<T>): Array<T>;
export declare function addOne(value: number): number;
export declare function print(...args: Array<unknown>): void;
export declare function sum(...args: Array<number>): number;
export declare function throwErrorWithMessage(message: string): never;
export declare function throwInput(x: object): never;
export declare function throwErrorWithMessageIf(cond: boolean, message: string): void;
export declare function logValue<T>(value: T): void;
export declare function useHook(): object;
export declare function useNoAlias(..._args: Array<any>): object;
export declare function useIdentity<T>(arg: T): T;
export declare function invoke<T extends Array<any>, ReturnType>(fn: (...input: T) => ReturnType, ...params: T): ReturnType;
export declare function conditionalInvoke<T extends Array<any>, ReturnType>(shouldInvoke: boolean, fn: (...input: T) => ReturnType, ...params: T): ReturnType | null;
/**
 * React Components
 */
export declare function Text(props: {
    value: string;
    children?: Array<React.ReactNode>;
}): React.ReactElement;
export declare function StaticText1(props: {
    children?: Array<React.ReactNode>;
}): React.ReactElement;
export declare function StaticText2(props: {
    children?: Array<React.ReactNode>;
}): React.ReactElement;
export declare function RenderPropAsChild(props: {
    items: Array<() => React.ReactNode>;
}): React.ReactElement;
export declare function Stringify(props: any): React.ReactElement;
export declare function Throw(): void;
export declare function ValidateMemoization({ inputs, output: rawOutput, onlyCheckCompiled, }: {
    inputs: Array<any>;
    output: any;
    onlyCheckCompiled?: boolean;
}): React.ReactElement;
export declare function createHookWrapper<TProps, TRet>(useMaybeHook: (props: TProps) => TRet): FunctionComponent<TProps>;
export declare function toJSON(value: any, invokeFns?: boolean): string;
export declare class Builder {
    vals: Array<any>;
    static makeBuilder(isNull: boolean, ...args: Array<any>): Builder | null;
    push(...args: Array<any>): Builder;
}
export declare const ObjectWithHooks: {
    useFoo(): number;
    useMakeArray(): Array<number>;
    useIdentity<T>(arg: T): T;
};
export declare function useFragment(..._args: Array<any>): object;
export declare function useSpecialEffect(fn: () => any, _secondArg: any, deps: Array<any>): void;
export declare function typedArrayPush<T>(array: Array<T>, item: T): void;
export declare function typedLog(...values: Array<any>): void;
export declare function typedIdentity<T>(value: T): T;
export declare function typedAssign<T>(x: T): T;
export declare function typedAlias<T>(x: T): T;
export declare function typedCapture<T>(x: T): Array<T>;
export declare function typedCreateFrom<T>(array: Array<T>): T;
export declare function typedMutate(x: any, v?: any): void;
export default typedLog;
