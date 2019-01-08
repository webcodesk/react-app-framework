import React from 'react';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import get from 'lodash/get';
import NotFoundComponent from '../NotFoundComponent';

let electron;
if (window.require) {
  electron = window.require('electron');
}

let sendDebugMessage;
let constants;
if (process.env.NODE_ENV !== 'production') {
  sendDebugMessage = require('../../commons/sendMessage').default;
  constants = require('../../commons/constants');
}

class ComponentView extends React.Component {
  static propTypes = {
    userComponents: PropTypes.object,
    userComponentStories: PropTypes.object,
  };

  static defaultProps = {
    userComponents: {},
    userComponentStories: {},
  };

  constructor (props) {
    super(props);
    this.handleReceiveMessage = this.handleReceiveMessage.bind(this);
    this.renderComponent = this.renderComponent.bind(this);
    this.state = {
      resourceType: null,
      resourceIndex: null,
      properties: [],
    };
  }

  componentDidMount () {
    if (electron) {
      electron.ipcRenderer.on('message', this.handleReceiveMessage);
    }
  }

  componentWillUnmount () {
    if (electron) {
      electron.ipcRenderer.removeListener('message', this.handleReceiveMessage);
    }
  }

  handleReceiveMessage (event, message) {
    if (message) {
      const { type, payload } = message;
      let resourceIndex;
      let properties;
      if (payload) {
        resourceIndex = payload.componentName;
        properties = payload.properties;
      }
      if (type === constants.WEBCODESK_MESSAGE_COMPONENT_RESOURCE_INDEX) {
        this.setState({
          resourceType: 'component',
          resourceIndex,
          properties
        });
      } else if (type === constants.WEBCODESK_MESSAGE_COMPONENT_STORY_RESOURCE_INDEX) {
        this.setState({
          resourceType: 'componentStory',
          resourceIndex,
          properties,
        });
      }
    }
  }

  handleComponentEvent = (eventName) => (args) => {
    if (process.env.NODE_ENV !== 'production') {
      sendDebugMessage({
        eventName,
        args,
        timestamp: Date.now(),
      });
    }
  };

  renderComponent () {
    const { resourceType, resourceIndex, properties } = this.state;
    if (!resourceIndex || !resourceType) {
      return null;
    }
    const { userComponents, userComponentStories } = this.props;
    // this is a user custom component, create container for it
    const wrappedComponent = resourceType === 'component'
      ? get(userComponents, resourceIndex, null)
      : get(userComponentStories, resourceIndex, null);
    if (!wrappedComponent || (typeof wrappedComponent !== 'function' && !wrappedComponent.renderStory)) {
      return React.createElement(
        NotFoundComponent,
        { key: uniqueId('notFound'), componentName: resourceIndex }
      );
    }
    const eventHandlers = {};
    if (properties && properties.length > 0) {
      properties.forEach(property => {
        eventHandlers[property.name] = this.handleComponentEvent(property.name);
      });
    }
    if (wrappedComponent.renderStory) {
      return React.createElement(
        wrappedComponent.renderStory,
        { key: resourceIndex, ...eventHandlers },
      );
    }
    return React.createElement(
      wrappedComponent,
      { key: resourceIndex, ...eventHandlers },
    );
  }

  render () {
    if (!electron) {
      return (<h3>Works only in electron environment.</h3>);
    }
    return this.renderComponent();
  }
}

export default ComponentView;
