export default function universalReducer (state = {}, action) {
  const { payload, type } = action;
  console.info('Universal reducer: ', type, payload);
  return { ...state, ...{ [type]: { ...state[type], ...payload } } };
};
