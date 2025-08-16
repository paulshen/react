// @effectfulFunctions:["useLog"]

function useLog() {}

function Component(props) {
  if (props.flag) {
    useLog();
  }
  return <div />;
}
