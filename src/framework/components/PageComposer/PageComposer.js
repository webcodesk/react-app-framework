import get from 'lodash/get';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import PropTypes from 'prop-types';
import ComponentWrapper from "./ComponentWrapper";
import Placeholder from './Placeholder';
import NotFoundComponent from '../NotFoundComponent';
import WarningComponent from '../WarningComponent';
import * as mouseOverBoundaries from './mouseOverBoundaries';
import * as selectedBoundaries from './selectedBoundaries';

let electron;
if (window.require) {
  electron = window.require('electron');
}

let constants;
if (process.env.NODE_ENV !== 'production') {
  constants = require('../../commons/constants');
}

// ToDo: remove once the WebpackDevServer fixes HMR - it should preserve React components state (now it does not)
// https://github.com/webpack/webpack-dev-server/issues/1377
// https://github.com/gaearon/react-hot-loader/issues/934
let storeComponentsTree;

const renderComponent = (userComponents, description, serviceComponentOptions, rootProps) => {
  if (description) {
    const {type, key, props, children} = description;
    if (!type || !props) {
      return rootProps;
    }
    const { componentName, propertyName, propertyValue, isSelected } = props;
    if (type === constants.COMPONENT_PROPERTY_ELEMENT_TYPE) {
      const placeholderProps = {
        key,
        elementKey: key,
        elementProperty: propertyName,
        ...serviceComponentOptions
      };
      const newElement = React.createElement(Placeholder, placeholderProps);
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
            propsComponent = renderComponent(userComponents, child, serviceComponentOptions, propsComponent);
          });
        }
        const wrapperProps = {
          key,
          elementKey: key,
          wrappedProps: propsComponent,
          wrappedComponent: component,
          isSelected,
          ...serviceComponentOptions,
        };
        newElement = React.createElement(ComponentWrapper, wrapperProps);
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
            rootProps = cloneDeep(propertyValue);
          }
        }
      }
    } else if (type === constants.COMPONENT_PROPERTY_SHAPE_TYPE) {
      let newObject = {};
      if (children && children.length > 0) {
        children.forEach(child => {
          newObject = renderComponent(userComponents, child, serviceComponentOptions, newObject);
        });
      }
      if (rootProps) {
        if (propertyName) {
          rootProps[propertyName] = newObject;
        } else {
          rootProps.push(newObject);
        }
      }
    } else if (type === constants.COMPONENT_PROPERTY_ARRAY_OF_TYPE) {
      let newArrayModel = [];
      if (children && children.length > 0) {
        children.forEach(child => {
          newArrayModel = renderComponent(userComponents, child, serviceComponentOptions, newArrayModel);
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

class PageComposer extends React.Component {
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
    this.sendMessage = this.sendMessage.bind(this);
    this.renderElectronError = this.renderElectronError.bind(this);
    this.itemWasDropped = this.itemWasDropped.bind(this);

    this.handleSelectCell = this.handleSelectCell.bind(this);

    this.state = {
      componentsTree: storeComponentsTree || {},
      draggedItem: null,
    };
  }

  componentDidMount () {
    if (electron) {
      electron.ipcRenderer.on('message', this.handleReceiveMessage);
    }
    mouseOverBoundaries.initElements();
    selectedBoundaries.initElements();
  }

  componentWillUnmount() {
    if (electron) {
      electron.ipcRenderer.removeListener('message', this.handleReceiveMessage);
    }
    mouseOverBoundaries.destroyElements();
    selectedBoundaries.destroyElements();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      componentsTree,
      draggedItem,
    } = this.state;
    return componentsTree !== nextState.componentsTree
      || draggedItem !== nextState.draggedItem;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { componentsTree } = this.state;
    if (componentsTree !== prevState.componentsTree) {
      storeComponentsTree = componentsTree;
    }
  }

  handleReceiveMessage(event, message) {
    if (message) {
      const {type, payload} = message;
      if (type === constants.WEBCODESK_MESSAGE_UPDATE_PAGE_COMPONENTS_TREE) {
        this.setState({
          componentsTree: payload,
        });
      } else if(type === constants.WEBCODESK_MESSAGE_COMPONENT_ITEM_DRAG_START) {
        this.setState({
          draggedItem: payload,
        })
      } else if(type === constants.WEBCODESK_MESSAGE_COMPONENT_ITEM_DRAG_END) {
        this.setState({
          draggedItem: null,
        })
      } else if(type === constants.WEBCODESK_MESSAGE_DELETE_PAGE_COMPONENT) {
        window.dispatchEvent(new CustomEvent('selectComponentWrapper', {detail: {
            domNode: null
          }}));
      }
    }
  }

  sendMessage(message) {
    if (message) {
      electron.ipcRenderer.sendToHost('message', message);
    }
  }

  itemWasDropped(testItem) {
    this.sendMessage({
      type: constants.FRAMEWORK_MESSAGE_COMPONENT_ITEM_WAS_DROPPED,
      payload: testItem
    });
  }

  handleSelectCell(cellKey) {
    this.sendMessage({
      type: constants.FRAMEWORK_MESSAGE_PAGE_CELL_WAS_SELECTED,
      payload: {
        targetKey: cellKey,
      }
    });
  }

  renderPage() {
    const {userComponents} = this.props;
    const {
      componentsTree,
      draggedItem,
    } = this.state;
    const rootComponent = renderComponent(userComponents, componentsTree, {
      itemWasDropped: this.itemWasDropped,
      draggedItem,
      onMouseDown: this.handleSelectCell,
    });
    return rootComponent;
  }

  renderElectronError() {
    return (
      <WarningComponent message="Works only in Electron" />
    );
  }

  render () {
    let content = electron ? this.renderPage() : this.renderElectronError();
    if (content) {
      return content;
    }
    return <span />;
  }
}

export default PageComposer;
