export const setFirstString = () => (dispatch) => {
  console.info('Set first string ------------------>');
  dispatch('firstString', 'Alex First C');
  dispatch('firstString1', 'Alex First 111111');
};
