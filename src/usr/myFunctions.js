export const transformValue = (value) => (dispatch) => {
  const newValue = `Transformed: ${value}`;
  console.info('Call transform value: ', value);
  dispatch('newValue', newValue);
};