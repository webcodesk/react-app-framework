export const setFirstString = () => (dispatch) => {
  console.info('Set first string ------------------>');
  dispatch('firstString', 'Alex First A');
  dispatch('firstString1', 'Alex First 1');
};

export const setSecondString = () => (dispatch) => {
  dispatch('secondString', 'Ira Second');
};

export const setDoubleSecondString = () => (dispatch) => {
  dispatch('secondDoubleString', 'Ira Second Double');
};

export const setDoubleStrings = () => (dispatch) => {
  console.info('Set Double Strings invoke -------------->');
  dispatch('firstStringD', 'Alex First D');
  setTimeout(() => {
    dispatch('secondStringD', 'Ira Second Delayed');
  }, 2000);
};
