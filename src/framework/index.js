import React from 'react';
import { Provider } from 'react-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import { configureStore } from './store/store';
import { clearActionsCache } from './store/actions';
import { createActionSequences } from './store/sequences';

import PageRouter from './pages/pageRouter/PageRouter';
import StartWrapper from './pages/startWrapper/StartWrapper';

let ComponentView;
if (process.env.NODE_ENV !== 'production') {
  ComponentView = require('./pages/componentView/ComponentView').default;
}

let store;
let history;

export const initStore = (name, version) => {
  console.info('Init Store');
  history = createBrowserHistory();
  store = configureStore({}, { history }, { name, version });
};

const Application = (props) => {
  if (!store) {
    return (
      <h1>Initialize store first</h1>
    );
  }
  const { schema, userComponents, userFunctions, userComponentStories } = props;
  console.info('Application: ', userComponents);
  console.info('Window location URL: ', window.location.href);
  if (process.env.NODE_ENV !== 'production' && window.location.href.indexOf('/webcodesk__component_view') > 0) {
    return (
      <ComponentView
        userComponents={userComponents}
        userComponentStories={userComponentStories}
      />
    );
  }
  clearActionsCache();
  const { routes, pages, flows } = schema;
  const actionSequences = createActionSequences(flows, userFunctions);
  console.info('Render Application');
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