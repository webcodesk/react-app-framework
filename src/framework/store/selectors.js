import { createSelector } from 'reselect';
/**
 * Direct selector to the main state domain
 */
const select = (pageName, componentName, componentInstance) => (state) => {
  // console.info('Invoke global selector for: ', pageName, componentName, componentInstance);
  return state[`${pageName}_${componentName}_${componentInstance}`];
};

/**
 * Other specific selectors
 */
export const createContainerSelector = (pageName, componentName, componentInstance) => {
  // console.info('Container selector is created: ', pageName, componentName, componentInstance);
  return createSelector(
    select(pageName, componentName, componentInstance),
    a => a
  );
};


export default createContainerSelector;