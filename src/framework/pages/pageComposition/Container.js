import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import createContainerSelector from '../../store/selectors';
import createContainerActions from '../../store/actions';

class Container extends React.Component {

  componentDidMount() {
    const { componentName, componentInstance } = this.props;
    console.info('MountContainer: ', componentName, componentInstance);
  }

  render () {
    const { componentName, componentInstance, wrappedComponent, wrappedProps, stateProps } = this.props;
    console.info('RenderContainer: ', componentName, componentInstance);
    const wrappedHandlers = {};
    const { containerEventHandlers, actions } = this.props;
    if (containerEventHandlers && containerEventHandlers.length > 0) {
      containerEventHandlers.forEach(eventHandler => {
        wrappedHandlers[eventHandler.name] = function() {
          const args = arguments;
          // console.info(`Invoke ${eventHandler.name} event: `, args);
          const handlerAction = actions[`${eventHandler.name}`];
          handlerAction.apply(null, args);
        };
      });
    }
    console.info('Wrapped props: ', wrappedProps);
    return React.createElement(wrappedComponent, { ...wrappedProps, ...stateProps, ...wrappedHandlers });
  }
}

export default function createContainer(
  wrappedComponent,
  componentName,
  componentInstance,
  containerEventHandlers,
  props = {},
  nestedComponents = null
) {
  // console.info('bindActionCreators: ', pageName, componentName, componentInstance, containerEventHandlers);
  const actions = createContainerActions(containerEventHandlers);
  const mapDispatchToProps = (dispatch) => {
    // console.info('bindActionCreators: ', actions);
    return { actions: bindActionCreators(actions, dispatch) };
  };
  const mapStateToProps = createStructuredSelector({
    stateProps: createContainerSelector(componentName, componentInstance),
  });
  const wrapperProps = {
    key: props.key,
    componentName,
    componentInstance,
    containerEventHandlers,
    wrappedProps: props,
    wrappedComponent,
  };
  return React.createElement(
    connect(mapStateToProps, mapDispatchToProps)(Container),
    wrapperProps,
    nestedComponents
  );
}