import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import createContainerSelector from '../../store/selectors';
import createContainerActions from '../../store/actions';

let sendDebugMessage;
let constants;
if (process.env.NODE_ENV !== 'production') {
  sendDebugMessage = require('../../commons/sendMessage').default;
  constants = require('../../commons/constants');
}

class Container extends React.Component {
  constructor (props, context) {
    super(props, context);
    const {
      componentName,
      componentInstance,
      componentKey,
    } = this.props;
    this.wrappedHandlers = {};
    const { containerEventHandlers, actions } = this.props;
    if (containerEventHandlers && containerEventHandlers.length > 0) {
      containerEventHandlers.forEach(eventHandler => {
        this.wrappedHandlers[eventHandler.name] = function () {
          const args = arguments;
          const handlerAction = actions[eventHandler.name];
          if (handlerAction) {
            if (process.env.NODE_ENV !== 'production') {
              if (window.__webcodeskIsListeningToFramework && window.__sendFrameworkMessage) {
                sendDebugMessage({
                  key: componentKey,
                  eventType: constants.DEBUG_MSG_COMPONENT_FIRE_EVENT,
                  eventName: eventHandler.name,
                  outputData: args && args.length > 0 ? cloneDeep(args[0]) : undefined,
                  componentName,
                  componentInstance,
                  timestamp: Date.now(),
                });
              }
            }
            handlerAction.apply(null, [args[0], args[1]]);
          } else {
            console.error(
              `[Framework] Event handler was not found for ${eventHandler.name} event in ${componentName} instance ${componentInstance}`
            );
          }
        };
      });
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    if (process.env.NODE_ENV !== 'production') {
      if (nextProps.stateProps !== this.props.stateProps) {
        if (window.__webcodeskIsListeningToFramework && window.__sendFrameworkMessage) {
          const { componentName, componentInstance, componentKey } = this.props;
          sendDebugMessage({
            key: componentKey,
            eventType: constants.DEBUG_MSG_NEW_PROPS_EVENT,
            inputData: cloneDeep(nextProps.stateProps),
            componentName,
            componentInstance,
            timestamp: Date.now(),
          });
        }
      }
    }
    return true;
  }

  render () {
    const {
      wrappedComponent,
      wrappedProps,
      stateProps,
      populatedProps,
      children
    } = this.props;
    return React.createElement(
      wrappedComponent,
      { ...wrappedProps, ...this.wrappedHandlers, ...populatedProps, ...stateProps },
      children
    );
  }
}

class Component extends React.Component {
  render () {
    const {
      wrappedComponent,
      wrappedProps,
      children
    } = this.props;
    return React.createElement(
      wrappedComponent,
      wrappedProps,
      children
    );
  }
}

export default function createContainer (
  wrappedComponent,
  componentName,
  componentInstance,
  componentKey,
  containerEventHandlers,
  containerProperties,
  props = {},
  populatedProps,
  nestedComponents = null
) {

  if ((containerProperties && containerProperties.length > 0)
    || (containerEventHandlers && containerEventHandlers.length > 0)) {
    // create a connected container only for components that participate in the flow
    const actions = createContainerActions(`${componentName}_${componentInstance}`, containerEventHandlers);
    const mapDispatchToProps = (dispatch) => {
      return { actions: bindActionCreators(actions, dispatch) };
    };

    const innerStructuresSelectorObject = {};
    if (containerProperties && containerProperties.length > 0) {
      containerProperties.forEach(propertyName => {
        innerStructuresSelectorObject[propertyName] =
          createContainerSelector(componentName, componentInstance, propertyName);
      });
    }

    const mapStateToProps = createStructuredSelector({
      stateProps: createStructuredSelector(innerStructuresSelectorObject),
    });

    const wrapperProps = {
      componentKey,
      componentName,
      componentInstance,
      containerEventHandlers,
      containerProperties,
      wrappedProps: props,
      populatedProps,
      wrappedComponent,
    };

    return React.createElement(
      connect(mapStateToProps, mapDispatchToProps)(Container),
      { ...wrapperProps, key: `container_${props.key}` },
      nestedComponents
    );
  }

  return React.createElement(
    Component,
    { wrappedComponent, wrappedProps: props, key: `component_${props.key}` },
    nestedComponents
  );
}