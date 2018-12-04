const viewData = {
  name: "I'm view data",
};

export const setFirstString = () => async (dispatch) => {
  console.info('Set first string ------------------>');
  dispatch('firstString', 'Alex First A');
  // dispatch('viewData', viewData);
  dispatch('viewData', viewData);
};

export const setSecondString = () => (dispatch) => {
  dispatch('secondString', 'Ira Second');
};

export const setDoubleSecondString = () => (dispatch) => {
  dispatch('secondDoubleString', 'Ira Second Double');
};

export const setDoubleStrings = () => (dispatch) => {
  console.info('Set Double Strings invoke -------------->');
  dispatch('firstStringD', new String('Alex First D'));
  setTimeout(() => {
    dispatch('secondStringD', 'Ira Second Delayed');
  }, 2000);
};
