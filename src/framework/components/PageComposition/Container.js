import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import createContainerSelector from '../../store/selectors';
import createContainerActions from '../../store/actions';
import { getComponentName } from '../NotFoundComponent/NotFoundComponent';

let sendDebugMessage;
let constants;
if (process.env.NODE_ENV !== 'production') {
  sendDebugMessage = require('../../commons/sendMessage').default;
  constants = require('../../commons/constants');
}
class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch (error, info) {
    this.setState({ hasError: true, error });
  }

  render () {
    const {hasError, error} = this.state;
    if (hasError) {
      const { componentName } = this.props;
      return (
        <div style={{color: 'white', backgroundColor: 'red', borderRadius: '4px', padding: '.5em'}}>
          <code>Error occurred in "{getComponentName(componentName)}" component: </code>
          <code>{error && error.message}</code>
        </div>
      );
    }
    return this.props.children;
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
    const {
      wrappedComponent,
      wrappedProps,
      stateProps,
      children
    } = this.props;
    return React.createElement(
      wrappedComponent,
      { ...wrappedProps, ...this.wrappedHandlers, ...stateProps },
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
      key: props.key,
      componentKey,
      componentName,
      componentInstance,
      containerEventHandlers,
      containerProperties,
      wrappedProps: props,
      wrappedComponent,
    };

    return (
      <ErrorBoundary key={`errorBoundary_${props.key}`} componentName={componentName}>
        {React.createElement(
          connect(mapStateToProps, mapDispatchToProps)(Container),
          wrapperProps,
          nestedComponents
        )}
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary key={`errorBoundary_${props.key}`} componentName={componentName}>
      {React.createElement(
        wrappedComponent,
        props,
        nestedComponents
      )}
    </ErrorBoundary>
  );
}