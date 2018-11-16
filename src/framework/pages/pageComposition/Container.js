import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import createContainerSelector from '../../store/selectors';
import createContainerActions from '../../store/actions';

class Container extends React.Component {

  componentDidMount() {
    const { pageName, componentName, componentInstance } = this.props;
    console.info('MountContainer: ', pageName, componentName, componentInstance);
  }

  render () {
    const { pageName, componentName, componentInstance, wrappedComponent, wrappedProps, stateProps } = this.props;
    console.info('RenderContainer: ', pageName, componentName, componentInstance);
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
  wrappedComponent, pageName, componentName, componentInstance, containerEventHandlers, props = {}
) {
  // console.info('bindActionCreators: ', pageName, componentName, componentInstance, containerEventHandlers);
  const actions = createContainerActions(containerEventHandlers);
  const mapDispatchToProps = (dispatch) => {
    // console.info('bindActionCreators: ', actions);
    return { actions: bindActionCreators(actions, dispatch) };
  };
  const mapStateToProps = createStructuredSelector({
    stateProps: createContainerSelector(pageName, componentName, componentInstance),
  });
  const wrapperProps = {
    key: props.key,
    pageName,
    componentName,
    componentInstance,
    containerEventHandlers,
    wrappedProps: props,
    wrappedComponent,
  };
  return React.createElement(
    connect(mapStateToProps, mapDispatchToProps)(Container),
    wrapperProps
  );
}