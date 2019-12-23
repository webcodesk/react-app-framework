import React from 'react';
import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import { pickInObject, omitInObject } from '../../commons/utilities';
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

function mergeCustomizer(objValue, srcValue) {
  if (isArray(objValue)) {
    return srcValue;
  }
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
              sendDebugMessage({
                key: componentKey,
                eventType: constants.DEBUG_MSG_COMPONENT_FIRE_EVENT,
                eventName: eventHandler.name,
                outputData: args && args.length > 0 ? args[0] : undefined,
                componentName,
                componentInstance,
                timestamp: Date.now(),
              });
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
        const { componentName, componentInstance, componentKey } = this.props;
        sendDebugMessage({
          key: componentKey,
          eventType: constants.DEBUG_MSG_NEW_PROPS_EVENT,
          inputData: nextProps.stateProps,
          componentName,
          componentInstance,
          timestamp: Date.now(),
        });
      }
    }
    return true;
  }

  render () {
    const wrapperPicked = pickInObject(
      this.props,
      ['wrappedComponent', 'wrappedProps', 'stateProps', 'populatedProps', 'children']
    );
    const restPicked = omitInObject(
      this.props,
      [
        'componentKey',
        'componentName',
        'componentInstance',
        'containerEventHandlers',
        'containerProperties',
        'wrappedProps',
        'populatedProps',
        'wrappedComponent',
        'children'
      ]
    );
    const {
      wrappedComponent,
      wrappedProps,
      stateProps,
      populatedProps,
      children
    } = wrapperPicked;
    return React.createElement(
      wrappedComponent,
      mergeWith(
        { ...restPicked, ...wrappedProps, ...this.wrappedHandlers, ...populatedProps},
        stateProps,
        mergeCustomizer
      ),
      children
    );
  }
}

class Component extends React.Component {
  render () {
    const wrapperPicked = pickInObject(
      this.props,
      ['wrappedComponent', 'wrappedProps', 'children']
    );
    const restPicked = omitInObject(
      this.props,
      ['wrappedComponent', 'wrappedProps', 'children']
    );
    const {
      wrappedComponent,
      wrappedProps,
      children
    } = wrapperPicked;
    return React.createElement(
      wrappedComponent,
      { ...restPicked, ...wrappedProps },
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