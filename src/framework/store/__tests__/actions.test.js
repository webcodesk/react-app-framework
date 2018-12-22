import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import schema from '../../../test/actions/app/schema';
import userFunctions from '../../../test/actions/app/indices/userFunctions';
import { createActionSequences } from '../sequences';
import createContainerActions from '../actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.setTimeout(2000 * 200);

let containerKey = 'usr.Form.Form_form';
let containerEvents;
let store;

describe('Actions', () => {

  beforeAll(() => {
    const { actionSequences } = createActionSequences(schema.flows, userFunctions);
    const containerSequence = actionSequences[containerKey];
    containerEvents = containerSequence.events;
    store = mockStore({});

    console.info = () => {};

  });

  it('run action only', () => {

    const containerActions = createContainerActions(containerKey, containerEvents);
    store.clearActions();
    store.dispatch(containerActions['onSubmit']());
    return new Promise(resolve => {
      setTimeout(() => {
        const actions = store.getActions();
        expect(actions).toMatchSnapshot();
        resolve();
      }, 2000);
    });

  });

  // it('repeat 10 times', () => {
  //   let used = process.memoryUsage().heapUsed / 1024 / 1024;
  //   console.log(`repeat 10 times before: approximately ${used} MB`);
  //
  //   let sequence = Promise.resolve();
  //   for(let i = 0; i < 10; i++) {
  //     sequence = sequence.then(() => {
  //       const containerActions = createContainerActions(containerKey, containerEvents);
  //       store.dispatch(containerActions['onSubmit']());
  //       return new Promise(resolve => {
  //         setTimeout(() => {
  //           resolve();
  //         }, 2000);
  //       })
  //     });
  //   }
  //   return sequence.then(() => {
  //     // const actions = store.getActions();
  //     // console.info('Result actions: ', JSON.stringify(actions, null, 4));
  //     used = process.memoryUsage().heapUsed / 1024 / 1024;
  //     console.log(`repeat 10 times after: approximately ${used} MB`);
  //   });
  // });

  // it('repeat 100 times', () => {
  //   let used = process.memoryUsage().heapUsed / 1024 / 1024;
  //   console.log(`repeat 100 times before: approximately ${used} MB`);
  //
  //   let sequence = Promise.resolve();
  //   for(let i = 0; i < 100; i++) {
  //     sequence = sequence.then(() => {
  //       const containerActions = createContainerActions(containerKey, containerEvents);
  //       store.dispatch(containerActions['onSubmit']());
  //       return new Promise(resolve => {
  //         setTimeout(() => {
  //           resolve();
  //         }, 2000);
  //       })
  //     });
  //   }
  //   return sequence.then(() => {
  //     // const actions = store.getActions();
  //     // console.info('Result actions: ', JSON.stringify(actions, null, 4));
  //     used = process.memoryUsage().heapUsed / 1024 / 1024;
  //     console.log(`repeat 100 times after: approximately ${used} MB`);
  //   });
  // });

});
