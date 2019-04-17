import React from 'react';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import { configureStore } from './store/store';
import { clearActionsCache } from './store/actions';
import { createActionSequences } from './store/sequences';

import PageRouter from './components/PageRouter';
import StartWrapper from './components/StartWrapper';
import WarningComponent from './components/WarningComponent';

let constants;
let ComponentView;
let PageComposer;
let electron;
if (process.env.NODE_ENV !== 'production') {
  constants = require('./commons/constants');
  ComponentView = require('./components/ComponentView/ComponentView').default;
  PageComposer = require('./components/PageComposer/PageComposer').default;
  if (window.require) {
    electron = window.require('electron');
  }
}

let store;
let history;

export const initStore = (name, version, initialState = {}) => {
  history = createBrowserHistory();
  store = configureStore(initialState, { history }, { name, version });

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
        const { type } = message;
        if (type === constants.WEBCODESK_MESSAGE_START_LISTENING_TO_FRAMEWORK) {
          window.__webcodeskIsListeningToFramework = true;
          setTimeout(() => {
            window.__sendFrameworkMessage({
              type: constants.FRAMEWORK_MESSAGE_INIT_DEBUG,
              payload: {
                actionSequences: this.actionSequences,
                targetProperties: this.targetProperties,
              },
            });
          }, 0);
        } else if (type === constants.WEBCODESK_MESSAGE_STOP_LISTENING_TO_FRAMEWORK) {
          window.__webcodeskIsListeningToFramework = false;
        }
      }
    }
  };

  render () {
    if (!store) {
      return (
        <WarningComponent message="Redux store is not initialized." />
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
    // store action sequences and components properties in case we have to send them for debug
    this.actionSequences = actionSequences;
    this.targetProperties = targetProperties;
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