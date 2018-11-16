import { createSelector } from 'reselect';
/**
 * Direct selector to the main state domain
 */
const select = (componentName, componentInstance) => (state) => {
  // console.info('Invoke global selector for: ', pageName, componentName, componentInstance);
  return state[`${componentName}_${componentInstance}`];
};

/**
 * Other specific selectors
 */
export const createContainerSelector = (componentName, componentInstance) => {
  // console.info('Container selector is created: ', pageName, componentName, componentInstance);
  return createSelector(
    select(componentName, componentInstance),
    a => a
  );
};


export default createContainerSelector;