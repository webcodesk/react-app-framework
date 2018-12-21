export const transformValue = (value) => (dispatch) => {
  const newValue = `Transformed: ${value}`;
  console.info('Call transform value: ', value);
  dispatch('newValue', newValue);
};

export const passData = () => (dispatch) => {
  dispatch('resultData', {
    name: 'My Name',
    value: 1234.6
  });
};
