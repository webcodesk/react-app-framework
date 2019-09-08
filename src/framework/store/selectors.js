import { createSelector } from 'reselect';

const select = (componentName, componentInstance, propertyName) => (state) => {
  const instanceState = state[`${componentName}_${componentInstance}`];
  console.info('instanceState: ', instanceState);
  if (instanceState) {
    console.info('instanceState: ', propertyName, instanceState[propertyName]);
    return instanceState[propertyName];
  }
  return undefined;
};

export const createContainerSelector = (componentName, componentInstance, propertyName) => {
  return createSelector(
    select(componentName, componentInstance, propertyName),
    a => a
  );
};

export default createContainerSelector;
