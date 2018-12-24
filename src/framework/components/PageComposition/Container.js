import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import createContainerSelector from '../../store/selectors';
import createContainerActions from '../../store/actions';
import NotFoundComponent from '../NotFoundComponent';

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

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (process.env.NODE_ENV !== 'production') {
      // if (window.__sendFrameworkMessage && window.__webcodeskIsListeningToFramework) {
        const { componentName, componentInstance, stateProps, containerProperties } = this.props;
        if (prevProps.stateProps !== stateProps) {
          if (containerProperties && containerProperties.length > 0) {
            containerProperties.forEach(propertyName => {
              if (stateProps[propertyName] !== prevProps.stateProps[propertyName]) {
                console.info('[Framework] Did update component: ', {
                  componentName,
                  componentInstance,
                  propertyName,
                  value: stateProps[propertyName],
                  timestamp: Date.now()
                });
                // setTimeout(() => {
                //   window.__sendFrameworkMessage({
                //     type: constants.FRAMEWORK_MESSAGE_CONTAINER_UPDATED_PROPS,
                //     payload: {
                //       componentName,
                //       componentInstance,
                //       propertyName,
                //       stateProps: JSON.stringify(stateProps[propertyName])
                //     },
                //   });
                // }, 0);
              }
            });
          }
        }
      // }
    }
  }

  render () {
    const { wrappedComponent, wrappedProps, stateProps, componentName, componentInstance, children } = this.props;
    console.info('[Framework] Render container: ', {componentName, componentInstance, timestamp: Date.now()});
    const wrappedHandlers = {};
    const { containerEventHandlers, actions } = this.props;
    if (containerEventHandlers && containerEventHandlers.length > 0) {
      containerEventHandlers.forEach(eventHandler => {
        wrappedHandlers[eventHandler.name] = function () {
          const args = arguments;
          const handlerAction = actions[`${eventHandler.name}`];
          if (handlerAction) {
            console.info('[Framework] Invoke handler: ', {
              eventHandlerKey: `${componentName}_${componentInstance}_${eventHandler.name}`,
              eventHandlerName: eventHandler.name,
              payload: args[0],
              timestamp: Date.now()
            });
            handlerAction.apply(null, args);
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