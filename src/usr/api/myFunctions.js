const list = [];

export const addNewListItem = (value) => (dispatch) => {
  list.push({text: value});
  dispatch('newList', [...list]);
};