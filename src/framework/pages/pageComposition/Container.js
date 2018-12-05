import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import constants from '../../commons/constants';
import createContainerSelector from '../../store/selectors';
import createContainerActions from '../../store/actions';
import NotFoundComponent from './NotFoundComponent';

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

  constructor (props) {
    super(props);
  }

  componentDidMount () {
    const { componentName, componentInstance } = this.props;
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (process.env.NODE_ENV !== 'production') {
      // if (window.__sendFrameworkMessage && window.__webcodeskIsListeningToFramework) {
        const { componentName, componentInstance, stateProps, containerProperties } = this.props;
        if (prevProps.stateProps !== stateProps) {
          if (containerProperties && containerProperties.length > 0) {
            containerProperties.forEach(propertyName => {
              if (stateProps[propertyName] !== prevProps.stateProps[propertyName]) {
                console.info('Component receive data: ', componentInstance, propertyName, stateProps[propertyName]);
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
    const { wrappedComponent, wrappedProps, stateProps, componentName, componentInstance } = this.props;
    console.info('Render container: ', componentName, componentInstance);
    const wrappedHandlers = {};
    const { containerEventHandlers, actions } = this.props;
    if (containerEventHandlers && containerEventHandlers.length > 0) {
      containerEventHandlers.forEach(eventHandler => {
        wrappedHandlers[eventHandler.name] = function () {
          const args = arguments;
          // console.info(`Invoke ${eventHandler.name} event: `, args);
          const handlerAction = actions[`${eventHandler.name}`];
          if (handlerAction) {
            handlerAction.apply(null, args);
          } else {
            console.error(`Event handler was not found for ${eventHandler.name} event.`);
          }
        };
      });
    }
    // console.info('Wrapped component: ', wrappedComponent);
    // console.info('Wrapped props: ', wrappedProps);
    return React.createElement(wrappedComponent, { ...wrappedProps, ...stateProps, ...wrappedHandlers });
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
  // console.info('bindActionCreators: ', pageName, componentName, componentInstance, containerEventHandlers);
  const actions = createContainerActions(`${componentName}_${componentInstance}`, containerEventHandlers);
  const mapDispatchToProps = (dispatch) => {
    // console.info('bindActionCreators: ', actions);
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