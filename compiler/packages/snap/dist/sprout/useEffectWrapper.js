"use strict";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/* This file is used to test the effect auto-deps configuration, which
 * allows you to specify functions that should have dependencies added to
 * callsites.
 */
const react_1 = require("react");
function useEffectWrapper(f) {
    (0, react_1.useEffect)(() => {
        f();
    }, [f]);
}
exports.default = useEffectWrapper;
//# sourceMappingURL=useEffectWrapper.js.map