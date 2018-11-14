/**
 * Direct selector to the main state domain
 */
// eslint-disable-next-line
const select = () => state => state;

/**
 * Other specific selectors
 */
export const createContainerSelector = (pageName, componentName, componentInstance) => () => {
  return state => {
    console.info('Invoke selector: ', pageName, componentName, componentInstance);
    console.info('Invoke selector state: ', state);
    return state[`${pageName}_${componentName}_${componentInstance}`] || {};
  };
};


export default createContainerSelector;