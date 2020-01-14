import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import PropTypes from 'prop-types';
import createContainerActions from '../../store/actions';

const componentName = 'applicationStartWrapper';
const componentInstance = 'wrapperInstance';
const containerKey = `${componentName}_${componentInstance}`;

let sendDebugMessage;
let constants;
if (process.env.NODE_ENV !== 'production') {
  sendDebugMessage = require('../../commons/sendMessage').default;
  constants = require('../../commons/constants');
}

class StartWrapper extends React.Component {
  static propTypes = {
    actionSequences: PropTypes.object.isRequired,
    store: PropTypes.any.isRequired,
  };

  componentDidMount () {
    const { actionSequences, store } = this.props;
    let containerHandlers = [];
    let componentKey;
    const actionSequence = actionSequences[containerKey];
    if (actionSequence) {
      containerHandlers = actionSequence.events;
      componentKey = actionSequence.componentKey;
    }
    if (containerHandlers.length > 0) {
      const actions = createContainerActions(containerKey, containerHandlers);
      const onDidMountAction = actions['onApplicationStart'];
      if (onDidMountAction) {
        if (process.env.NODE_ENV !== 'production') {
          if (window.__webcodeskIsListeningToFramework && window.__sendFrameworkMessage) {
            sendDebugMessage({
              key: componentKey,
              eventType: constants.DEBUG_MSG_APPLICATION_START_EVENT,
              componentName,
              componentInstance,
              timestamp: Date.now(),
            });
          }
        }
        store.dispatch(onDidMountAction.apply(null, null));
      }
    }
  }

  render () {
    return this.props.children;
  }
}

export default StartWrapper;
