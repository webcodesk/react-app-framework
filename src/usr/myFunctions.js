export const transformValue = (value) => (dispatch) => {
  const newValue = `Transformed: ${value}`;
  console.info('Call transform value: ', value);
  dispatch('newValue', newValue);
  dispatch('newValue2', newValue);
  dispatch('hello');
  dispatch('hello4');
};

export const passData = () => (dispatch) => {
  dispatch('resultData', {
    name: 'My Name',
    value: 1234.6
  });
};
