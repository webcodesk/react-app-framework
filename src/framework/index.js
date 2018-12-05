import React from 'react';
import { Provider } from 'react-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import constants from './commons/constants';
import { configureStore } from './store/store';
import { clearActionsCache } from './store/actions';
import { createActionSequences } from './store/sequences';

import PageRouter from './pages/pageRouter/PageRouter';
import StartWrapper from './pages/startWrapper/StartWrapper';

let ComponentView;
let electron;
if (process.env.NODE_ENV !== 'production') {
  ComponentView = require('./pages/componentView/ComponentView').default;
  if (window.require) {
    electron = window.require('electron');
  }
}

let store;
let history;

export const initStore = (name, version) => {
  console.info('Init Store');
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
    if (message) {
      const {type, payload} = message;
      if (type === constants.WEBCODESK_MESSAGE_START_LISTENING_TO_FRAMEWORK) {
        window.__webcodeskIsListeningToFramework = true;
      } else if(type === constants.WEBCODESK_MESSAGE_STOP_LISTENING_TO_FRAMEWORK) {
        window.__webcodeskIsListeningToFramework = false;
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
    // console.info('Application: ', userComponents);
    console.info('Window location URL: ', window.location.href);
    if (process.env.NODE_ENV !== 'production') {
      if (window.location.href.indexOf('/webcodesk__component_view') > 0) {
        return (
          <ComponentView
            userComponents={userComponents}
            userComponentStories={userComponentStories}
          />
        );
      }
    }
    clearActionsCache();
    const { routes, pages, flows } = schema;
    const { actionSequences, targetProperties } = createActionSequences(flows, userFunctions);
    console.info('Render Application');
    // console.info('Action sequences: ', actionSequences);
    // console.info('Target properties: ', targetProperties);
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