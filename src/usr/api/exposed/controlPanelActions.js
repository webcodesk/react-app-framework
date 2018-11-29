export const setFirstString = () => (dispatch) => {
  console.info('Set first string ------------------>');
  dispatch('firstString', 'Alex First Changed');
  dispatch('firstString1', 'Alex First 111111');
};

export const setSecondString = () => (dispatch) => {
  dispatch('secondString', 'Ira Second');
};

export const setDoubleStrings = () => (dispatch) => {
  console.info('Set Double Strings invoke -------------->');
  dispatch('firstStringD', 'Alex First D');
  setTimeout(() => {
    dispatch('secondStringD', 'Ira Second D');
  }, 2000);
};
