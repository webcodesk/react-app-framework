import React from 'react';
import { Provider } from 'react-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import { configureStore } from './store/store';
import { clearActionsCache } from './store/actions';
import { createActionSequences } from './store/sequences';

import PageRouter from './pages/PageRouter';
import StartWrapper from './pages/StartWrapper';

let constants;
let ComponentView;
let PageComposer;
let electron;
if (process.env.NODE_ENV !== 'production') {
  constants = require('./commons/constants');
  ComponentView = require('./pages/ComponentView/ComponentView').default;
  PageComposer = require('./pages/PageComposer/PageComposer').default;
  if (window.require) {
    electron = window.require('electron');
  }
}

let store;
let history;

export const initStore = (name, version) => {
  console.info('[Framework] Init Store');
  history = createBrowserHistory();
  store = configureStore({}, { history }, { name, version });

  if (process.env.NODE_ENV !== 'production') {
    if (electron) {
      window.__sendFrameworkMessage = (message) => {
        if (message) {
          electron.ipcRenderer.sendToHost('message', message);
        }
      };
    }
  }
};

class Application extends React.Component {

  constructor (props) {
    super(props);
  }

  componentDidMount () {
    if (process.env.NODE_ENV !== 'production') {
      if (electron) {
        electron.ipcRenderer.on('message', this.handleReceiveMessage);
      }
    }
  }

  componentWillUnmount () {
    if (process.env.NODE_ENV !== 'production') {
      if (electron) {
        electron.ipcRenderer.removeListener('message', this.handleReceiveMessage);
      }
    }
  }

  handleReceiveMessage = (event, message) => {
    if (process.env.NODE_ENV !== 'production') {
      if (message) {
        const { type, payload } = message;
        if (type === constants.WEBCODESK_MESSAGE_START_LISTENING_TO_FRAMEWORK) {
          window.__webcodeskIsListeningToFramework = true;
        } else if (type === constants.WEBCODESK_MESSAGE_STOP_LISTENING_TO_FRAMEWORK) {
          window.__webcodeskIsListeningToFramework = false;
        }
      }
    }
  };

  render () {
    if (!store) {
      return (
        <h1>Initialize store first</h1>
      );
    }
    const { schema, userComponents, userFunctions, userComponentStories } = this.props;
    if (process.env.NODE_ENV !== 'production') {
      const href = window.location.href;
      if (href.indexOf('/webcodesk__component_view') > 0) {
        return (
          <ComponentView
            userComponents={userComponents}
            userComponentStories={userComponentStories}
          />
        );
      } else if(href.indexOf('/webcodesk__page_composer') > 0) {
        return (
          <PageComposer userComponents={userComponents} />
        )
      }
    }
    clearActionsCache();
    const { routes, pages, flows } = schema;
    const { actionSequences, targetProperties } = createActionSequences(flows, userFunctions);
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
            targetProperties={targetProperties}
          />
        </StartWrapper>
      </Provider>
    );
  }
}

export default Application;