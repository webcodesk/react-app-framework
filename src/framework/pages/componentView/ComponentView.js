import React from 'react';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import get from 'lodash/get';
import constants from '../../commons/constants';
import NotFoundComponent from './NotFoundComponent';

let electron;
if (window.require) {
  electron = window.require('electron');
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
    console.info('ComponentView received message: ', event, message);
    if (message) {
      const { type, payload } = message;
      if (type === constants.WEBCODESK_MESSAGE_COMPONENT_RESOURCE_INDEX) {
        this.setState({
          resourceType: 'component',
          resourceIndex: payload,
        });
      } else if (type === constants.WEBCODESK_MESSAGE_COMPONENT_STORY_RESOURCE_INDEX) {
        this.setState({
          resourceType: 'componentStory',
          resourceIndex: payload,
        });
      }
    }
  }

  renderComponent () {
    const { resourceType, resourceIndex } = this.state;
    if (!resourceIndex || !resourceType) {
      return null;
    }
    const { userComponents, userComponentStories } = this.props;
    // this is a user custom component, create container for it
    const wrappedComponent = resourceType === 'component'
      ? get(userComponents, resourceIndex, null)
      : get(userComponentStories, resourceIndex, null);
    // console.info('ComponentView renderComponent: ')
    if (!wrappedComponent || (typeof wrappedComponent !== 'function' && !wrappedComponent.renderStory)) {
      return React.createElement(
        NotFoundComponent,
        { key: uniqueId('notFound'), componentName: resourceIndex }
      );
    }
    if (wrappedComponent.renderStory) {
      return React.createElement(
        wrappedComponent.renderStory,
        { key: resourceIndex },
      );
    }
    return React.createElement(
      wrappedComponent,
      { key: resourceIndex },
    );
  }

  render () {
    if (!electron) {
      return (<h3>Works only in electron environment.</h3>);
    }
    return (
      <div style={{ padding: '2em' }}>
        {this.renderComponent()}
      </div>
    );
  }
}

export default ComponentView;
