import isEqual from 'lodash/isEqual';

export default function universalReducer (state = {}, action) {
  const { payload, type } = action;
  // const stateValue = state[type];
  // if (!isEqual(stateValue, payload)) {
  //   console.info('Dispatch Payload: ', type, payload);
  //   return { ...state, ...{ [type]: { ...stateValue, ...payload } } };
  // }
  // return state;
  return { ...state, ...{ [type]: { ...state[type], ...payload } } };
};
