import { createSelector } from 'reselect';
/**
 * Direct selector to the main state domain
 */
const select = (componentName, componentInstance, propertyName) => (state) => {
  // console.info('Invoke global selector for: ', pageName, componentName, componentInstance);
  const instanceState = state[`${componentName}_${componentInstance}`];
  if (instanceState) {
    return instanceState[propertyName];
  }
  return undefined;
};

/**
 * Other specific selectors
 */
export const createContainerSelector = (componentName, componentInstance, propertyName) => {
  // console.info('Container selector is created: ', pageName, componentName, componentInstance);
  return createSelector(
    select(componentName, componentInstance, propertyName),
    a => a
  );
};


export default createContainerSelector;