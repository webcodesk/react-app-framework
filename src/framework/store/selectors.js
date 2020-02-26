import { createSelector } from 'reselect';

const select = (componentName, componentInstance) => (state, props) => {
  const instanceState = state[`${componentName}_${componentInstance}`];
  if (instanceState) {
    if (props) {
      if (typeof instanceState !== 'undefined') {
        return instanceState;
      }
      return props.wrappedProps;
    } else {
      return instanceState;
    }
  } else if (props) {
    return props.wrappedProps;
  }
  return undefined;
};

export const createContainerSelector = (componentName, componentInstance) => {
  return createSelector(
    select(componentName, componentInstance),
    a => a
  );
};

export default createContainerSelector;
