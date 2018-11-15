export default function universalReducer (state = {}, action) {
  const { payload, type } = action;
  console.info('Universal reducer: ', type, payload);
  state[type] = { ...state[type], ...payload };
  return state;
};
