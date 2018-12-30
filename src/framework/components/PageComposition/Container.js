import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import createContainerSelector from '../../store/selectors';
import createContainerActions from '../../store/actions';
import NotFoundComponent from '../NotFoundComponent';

let sendDebugMessage;

if (process.env.NODE_ENV !== 'production') {
  sendDebugMessage = require('../../commons/sendMessage').default;
}

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch (error, info) {
    this.setState({ hasError: true });
  }

  render () {
    if (this.state.hasError) {
      const { componentName } = this.props;
      return <NotFoundComponent componentName={componentName}/>;
    }
    return this.props.children;
  }
}

class Container extends React.Component {

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    if (process.env.NODE_ENV !== 'production') {
      if (nextProps.stateProps !== this.props.stateProps) {
        const { componentName, componentInstance } = this.props;
        sendDebugMessage({
          eventType: 'receiveNewProps',
          data: nextProps.stateProps,
          componentName,
          componentInstance,
          timestamp: Date.now(),
        });
        // console.info(`[New Props] "${componentName}:${componentInstance}"`, nextProps.stateProps);
      }
    }
    return true;
  }

  render () {
    const {
      wrappedComponent,
      wrappedProps,
      stateProps,
      componentName,
      componentInstance,
      componentKey,
      children
    } = this.props;
    const wrappedHandlers = {};
    const { containerEventHandlers, actions } = this.props;
    if (containerEventHandlers && containerEventHandlers.length > 0) {
      containerEventHandlers.forEach(eventHandler => {
        wrappedHandlers[eventHandler.name] = function () {
          const args = arguments;
          const handlerAction = actions[eventHandler.name];
          if (handlerAction) {
            if (process.env.NODE_ENV !== 'production') {
              sendDebugMessage({
                key: componentKey,
                eventType: 'fireComponentEvent',
                eventName: eventHandler.name,
                payload: args && args.length > 0 ? args[0] : undefined,
                componentName,
                componentInstance,
                timestamp: Date.now(),
              });
              // console.info(`[${componentKey}] Component event fired "${componentName}:${componentInstance} -> ${eventHandler.name}"`, args[0]);
            }
            handlerAction.apply(null, [args[0]]);
          } else {
            console.error(
              `Event handler was not found for ${eventHandler.name} event in ${componentName} instance ${componentInstance}`
            );
          }
        };
      });
    }
    return React.createElement(wrappedComponent, { ...stateProps, ...wrappedProps, ...wrappedHandlers }, children);
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