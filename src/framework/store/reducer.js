export default function universalReducer (state = {}, action) {
  const { payload, type } = action;
  console.info('Dispatch Payload: ', type, payload);
  return { ...state, ...{ [type]: { ...state[type], ...payload } } };
};
