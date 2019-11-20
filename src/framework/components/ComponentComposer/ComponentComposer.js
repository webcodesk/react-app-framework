import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import PropTypes from 'prop-types';
import ComponentWrapper from './ComponentWrapper';
import NotFoundComponent from '../NotFoundComponent';
import Placeholder from './Placeholder';

let constants;
if (process.env.NODE_ENV !== 'production') {
  constants = require('../../commons/constants');
}

// ToDo: remove once the WebpackDevServer fixes HMR - it should preserve React components state (now it does not)
// https://github.com/webpack/webpack-dev-server/issues/1377
// https://github.com/gaearon/react-hot-loader/issues/934
let storeComponentsTree;

function sendMessage(message) {
  if (message) {
    window.parent.postMessage(message, '*');
  }
}

const handleComponentEvent = (eventName) => (args) => {
  if (process.env.NODE_ENV !== 'production') {
    sendMessage({
      type: constants.FRAMEWORK_MESSAGE_COMPONENT_EVENT,
      payload: {
        eventName,
        args,
        timestamp: Date.now(),
      }
    });
  }
};

const renderComponent = (userComponents, description, rootProps) => {
  if (description) {
    const {type, key, props, children} = description;
    if (!type || !props) {
      return rootProps;
    }
    const { componentName, propertyName, propertyValue } = props;
    if (type === constants.COMPONENT_PROPERTY_ELEMENT_TYPE) {
      const newElement = React.createElement(Placeholder, {key});
      if (rootProps) {
        if (propertyName) {
          rootProps[propertyName] = newElement;
        } else {
          rootProps.push(newElement);
        }
      } else {
        // only placeholder component can be the root element
        rootProps = newElement;
      }
    } else if (type === constants.PAGE_COMPONENT_TYPE) {
      let newElement;
      const component = get(userComponents, componentName, null);
      if (component) {
        let propsComponent = {};
        if (children && children.length > 0) {
          children.forEach(child => {
            propsComponent = renderComponent(userComponents, child, propsComponent);
          });
        }
        newElement = React.createElement(
          ComponentWrapper,
          {wrappedComponent: component, propsComponent, key}
        );
      } else {
        newElement = React.createElement(NotFoundComponent, {componentName});
      }
      if (rootProps) {
        if (propertyName) {
          // component assigned to some named property in the
          rootProps[propertyName] = newElement;
        } else {
          rootProps.push(newElement);
        }
      } else {
        // only page component can be the root element
        rootProps = newElement;
      }
    } else if (type === constants.COMPONENT_PROPERTY_ARRAY_TYPE
      || type === constants.COMPONENT_PROPERTY_OBJECT_TYPE) {
      if (rootProps) {
        if (propertyName) {
          if (propertyValue) {
            rootProps[propertyName] = cloneDeep(propertyValue);
          } else {
            rootProps[propertyName] = null;
          }
        } else {
          if (propertyValue) {
            rootProps.push(cloneDeep(propertyValue));
          }
        }
      }
    } else if (type === constants.COMPONENT_PROPERTY_SHAPE_TYPE) {
      let newObject = {};
      if (children && children.length > 0) {
        children.forEach(child => {
          newObject = renderComponent(userComponents, child, newObject);
        });
      }
      if (rootProps) {
        if (propertyName) {
          rootProps[propertyName] = newObject;
        } else {
          rootProps.push(newObject);
        }
      }
    } else if (type === constants.COMPONENT_PROPERTY_FUNCTION_TYPE) {
      if (rootProps && propertyName) {
        rootProps[propertyName] = handleComponentEvent(propertyName);
      }
    } else if (type === constants.COMPONENT_PROPERTY_ARRAY_OF_TYPE) {
      let newArrayModel = [];
      if (children && children.length > 0) {
        children.forEach(child => {
          newArrayModel = renderComponent(userComponents, child, newArrayModel);
        });
      }
      if (rootProps) {
        if (propertyName) {
          rootProps[propertyName] = newArrayModel;
        } else {
          rootProps.push(newArrayModel);
        }
      }
    } else if (type === constants.COMPONENT_PROPERTY_STRING_TYPE
      || type === constants.COMPONENT_PROPERTY_ONE_OF_TYPE
      || type === constants.COMPONENT_PROPERTY_SYMBOL_TYPE
      || type === constants.COMPONENT_PROPERTY_BOOL_TYPE
      || type === constants.COMPONENT_PROPERTY_ANY_TYPE
      || type === constants.COMPONENT_PROPERTY_NUMBER_TYPE) {
      if (rootProps) {
        if (propertyName) {
          rootProps[propertyName] = propertyValue || null;
        } else {
          if (propertyValue) {
            rootProps.push(propertyValue);
          }
        }
      }
    }
  }
  return rootProps;
};

class ComponentComposer extends React.Component {
  static propTypes = {
    userComponents: PropTypes.object,
  };

  static defaultProps = {
    userComponents: {},
  };

  constructor (props) {
    super(props);

    this.renderPage = this.renderPage.bind(this);
    this.handleReceiveMessage = this.handleReceiveMessage.bind(this);

    this.state = {
      componentsTree: storeComponentsTree || {},
    };
  }

  componentDidMount () {
    window.addEventListener("message", this.handleReceiveMessage, false);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.handleReceiveMessage);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { componentsTree } = this.state;
    return componentsTree !== nextState.componentsTree;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { componentsTree } = this.state;
    if (componentsTree !== prevState.componentsTree) {
      storeComponentsTree = componentsTree;
    }
  }

  handleReceiveMessage(event) {
    const {data: message} = event;
    if (message) {
      const {type, payload} = message;
      if (type === constants.WEBCODESK_MESSAGE_UPDATE_PAGE_COMPONENTS_TREE) {
        this.setState({
          componentsTree: payload,
        });
      }
    }
  }

  renderPage() {
    const { userComponents } = this.props;
    const { componentsTree } = this.state;
    return renderComponent(userComponents, componentsTree);
  }

  render () {
    let content = this.renderPage();
    if (content) {
      return content;
    }
    return <span />;
  }
}

export default ComponentComposer;
