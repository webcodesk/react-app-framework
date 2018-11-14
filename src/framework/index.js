import React from 'react';
import { Provider } from 'react-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import { configureStore } from './store/store';

import PageRouter from './pages';

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
  return (
    <Provider store={store}>
      <PageRouter
        history={history}
        routes={routes}
        pages={pages}
        flows={flows}
        userComponents={userComponents}
        userFunctions={userFunctions}
      />
    </Provider>
  );
};

export default Application;