
## Input

```javascript
// @effectfulFunctions:["useLog"]

function useLog() {}

function Component(props) {
  if (props.flag) {
    useLog();
  }
  return <div />;
}

```

## Code

```javascript
import { c as _c } from "react/compiler-runtime"; // @effectfulFunctions:["useLog"]
function useLog() {}
function Component(props) {
  const $ = _c(1);
  if (props.flag) {
    useLog();
  }
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = <div />;
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}

```
      