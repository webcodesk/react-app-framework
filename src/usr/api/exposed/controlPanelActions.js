export const setFirstString = () => (dispatch) => {
  dispatch('firstString', 'Alex First');
};

export const setSecondString = () => (dispatch) => {
  dispatch('secondString', 'Ira Second');
};

export const setDoubleStrings = () => (dispatch) => {
  dispatch('firstStringD', 'Alex First D');
  dispatch('secondStringD', 'Ira Second D');
};
