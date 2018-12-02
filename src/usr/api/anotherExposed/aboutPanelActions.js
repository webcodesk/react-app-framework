export const firstMethodInChain = () => (dispatch) => {
  dispatch('returnValue1', {author: 'Alexander Pustovalov'});
};

export const secondMethodInChain = (authorData) => (dispatch) => {
  dispatch('returnValue2', {...authorData, ...{day: '10', month: 'October', year: '1977'}});
};