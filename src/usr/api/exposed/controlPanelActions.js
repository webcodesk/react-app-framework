export const setFirstString = () => (dispatch) => {
  dispatch('firstString', 'Alex First');
};

export const setSecondString = () => (dispatch) => {
  dispatch('secondString', 'Ira Second');
};

export const setDoubleStrings = () => (dispatch) => {
  console.info('Set Double Strings invoke -------------->');
  dispatch('firstStringD', 'Alex First D');
  dispatch('secondStringD', 'Ira Second D');
};
