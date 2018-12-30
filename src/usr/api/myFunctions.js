const list = [];

export const addNewListItem = (value) => (dispatch) => {
  list.push({text: value});
  dispatch('newList', [...list]);
};

export const initialFunction = () => (dispatch) => {
  dispatch('success', 0);
  dispatch('data', 'Initial Data');
};

export const parallelFunction1 = (inputString) => (dispatch) => {
  dispatch('parallel', inputString + ' [function1]');
};

export const parallelFunction2 = (inputString) => (dispatch) => {
  dispatch('parallel', inputString + ' [function2]');
};