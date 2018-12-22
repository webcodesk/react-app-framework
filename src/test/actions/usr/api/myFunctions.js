export const validateForm = () => (dispatch) => {
  dispatch('success', 'The form was successfully validated');
  setTimeout(() => {
    dispatch('delayed', {value: 'Delayed object'});
  }, 1000);
};