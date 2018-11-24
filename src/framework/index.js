import React from 'react';
import { Provider } from 'react-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import { configureStore } from './store/store';
import { createActionSequences } from './store/sequences';

import PageRouter from './pages/pageRouter/PageRouter';
import StartWrapper from './pages/startWrapper/StartWrapper';

let store;
let history;

export const initStore = (name, version) => {
  history = createBrowserHistory();
  store = configureStore({}, {history}, {name, version});
};

const Application = (props) => {
  if (!store) {
    return (
      <h1>Initialize store first: <code><pre>initStore(name, version);</pre></code></h1>
    );
  }
  const {routes, pages, flows, userComponents, userFunctions} = props;
  console.info('Application: ', userComponents);
  const actionSequences = createActionSequences(flows, userFunctions);
  return (
    <Provider store={store}>
      <StartWrapper
        actionSequences={actionSequences}
        store={store}
      >
        <PageRouter
          history={history}
          routes={routes}
          pages={pages}
          userComponents={userComponents}
          actionSequences={actionSequences}
        />
      </StartWrapper>
    </Provider>
  );
};

export default Application;