import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import ComponentWrapper from "./ComponentWrapper";
import NotFoundComponent from '../NotFoundComponent';
import * as mouseOverBoundaries from './mouseOverBoundaries';
import * as selectedBoundaries from './selectedBoundaries';

let constants;
if (process.env.NODE_ENV !== 'production') {
  constants = require('../../commons/constants');
}

function sendMessage(message) {
  if (message) {
    window.parent.postMessage(message, '*');
  }
}

// ToDo: remove once the WebpackDevServer fixes HMR - it should preserve React components state (now it does not)
// https://github.com/webpack/webpack-dev-server/issues/1377
// https://github.com/gaearon/react-hot-loader/issues/934
let storeComponentsTree;

let selectedKeys = [];

const renderComponent = (userComponents, description, serviceComponentOptions, rootProps) => {
  if (description) {
    const {type, key, props, children} = description;
    if (!type || !props) {
      return rootProps;
    }
    const { componentName, propertyName, propertyValue, isSelected } = props;
    if (isSelected) {
      selectedKeys.push(key);
    }
    if (type === constants.COMPONENT_PROPERTY_ELEMENT_TYPE) {
      const placeholderProps = {
        key,
        elementKey: key,
        elementProperty: propertyName,
        isSelected,
        ...serviceComponentOptions
      };
      const newElement = React.createElement(ComponentWrapper, placeholderProps);
      if (rootProps) {
        if (propertyName) {
          rootProps[propertyName] = newElement;
        } else {
          if (rootProps.push) {
            rootProps.push(newElement);
          } else {
            console.error('It seems that you missed propertyName in the page component target in the page config.');
          }
        }
      } else {
        // only placeholder component can be the root element
        rootProps = newElement;
      }
    } else if (type === constants.PAGE_COMPONENT_TYPE || type === constants.PAGE_NODE_TYPE) {
      let newElement;
      const component = get(userComponents, componentName, null);
      if (component) {
        let propsComponent = {};
        if (children && children.length > 0) {
          children.forEach(child => {
            propsComponent = renderComponent(userComponents, child, serviceComponentOptions, propsComponent);
          });
        }
        let nestedComponents = [];
        if (propsComponent.children && isArray(propsComponent.children)) {
          nestedComponents = propsComponent.children;
          delete propsComponent.children;
        }
        const wrapperProps = {
          key,
          elementKey: key,
          wrappedProps: propsComponent,
          wrappedComponent: component,
          isSelected,
          ...serviceComponentOptions,
        };
        newElement = React.createElement(ComponentWrapper, wrapperProps, nestedComponents);
      } else {
        newElement = React.createElement(NotFoundComponent, {componentName});
      }
      if (rootProps) {
        if (propertyName) {
          // component assigned to some named property in the
          rootProps[propertyName] = newElement;
        } else {
          if (rootProps.push) {
            rootProps.push(newElement);
          } else {
            console.error('It seems that you missed propertyName in the page component target in the page config.');
          }
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
            rootProps[propertyName] = propertyValue;
          }
        } else {
          if (typeof propertyValue !== 'undefined') {
            rootProps.push(cloneDeep(propertyValue));
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
          if (rootProps.push) {
            rootProps.push(newObject);
          } else {
            console.error('It seems that you missed propertyName in the page component target in the page config.');
          }
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
          if (rootProps.push) {
            rootProps.push(newArrayModel);
          } else {
            console.error('It seems that you missed propertyName in the page component target in the page config.');
          }
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
          if (propertyName !== constants.COMPONENT_PROPERTY_DO_NOT_USE_IN_FLOWS_NAME) {
            rootProps[propertyName] = propertyValue;
          }
        } else {
          if (typeof propertyValue !== 'undefined') {
            if (rootProps.push) {
              rootProps.push(propertyValue);
            } else {
              console.error('It seems that you missed propertyName in the page component target in the page config.');
            }
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
    this.handleComponentInstanceInitialize = this.handleComponentInstanceInitialize.bind(this);
    this.handleComponentInstanceDestroy = this.handleComponentInstanceDestroy.bind(this);
    this.itemWasDropped = this.itemWasDropped.bind(this);

    this.handleSelectCell = this.handleSelectCell.bind(this);
    this.handleContextMenuClick = this.handleContextMenuClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.componentInstancesMap = {};

    this.state = {
      componentsTree: storeComponentsTree || {},
      draggedItem: null,
      draggedItemPosition: null,
    };
  }

  componentDidMount () {
    const paramsMap = queryString.parse(window.location.search);
    if (paramsMap && paramsMap.iframeId) {
      this.iframeId = paramsMap.iframeId;
    }
    window.addEventListener("message", this.handleReceiveMessage, false);
    mouseOverBoundaries.initElements();
    selectedBoundaries.initElements();
    window.document.addEventListener('keydown', this.handleKeyDown);
    this.traverseComponentInstances();
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.handleReceiveMessage);
    mouseOverBoundaries.destroyElements();
    selectedBoundaries.destroyElements();
    window.document.removeEventListener('keydown', this.handleKeyDown);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      componentsTree,
      draggedItem,
      draggedItemPosition
    } = this.state;
    return componentsTree !== nextState.componentsTree
      || draggedItem !== nextState.draggedItem
      || draggedItemPosition !== nextState.draggedItemPosition;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { componentsTree } = this.state;
    if (componentsTree !== prevState.componentsTree) {
      storeComponentsTree = componentsTree;
      this.traverseComponentInstances();
    }
  }

  traverseComponentInstances() {
    if (selectedKeys && selectedKeys.length > 0) {
      selectedKeys.forEach(selectedKeyItem => {
        const componentRefs = this.componentInstancesMap[selectedKeyItem];
        if (componentRefs && componentRefs.length > 0) {
          componentRefs.forEach(componentInstance => {
            if (componentInstance && componentInstance.selectComponent) {
              componentInstance.selectComponent();
            }
          });
        }
      });
    } else {
      window.dispatchEvent(new CustomEvent('selectComponentWrapper', {
        detail: {
          domNode: null
        }
      }));
    }
  }

  handleComponentInstanceInitialize(elementKey, componentRef) {
    this.componentInstancesMap[elementKey] = this.componentInstancesMap[elementKey] || [];
    this.componentInstancesMap[elementKey].push(componentRef);
  }

  handleComponentInstanceDestroy(elementKey, componentRef) {
    const componentRefs = this.componentInstancesMap[elementKey];
    if (componentRefs) {
      if (componentRefs.length === 1) {
        delete this.componentInstancesMap[elementKey];
      } else if (componentRefs.length > 1) {
        const foundIndex = componentRefs.findIndex(i => i === componentRef);
        if (foundIndex >= 0) {
          componentRefs.splice(foundIndex, 1);
          this.componentInstancesMap[elementKey] = componentRefs;
        }
      }
    }
  }

  handleReceiveMessage(event) {
    const {data: message} = event;
    if (message) {
      const {type, payload, sourceId} = message;
      if (sourceId === this.iframeId) {
        if (type === constants.WEBCODESK_MESSAGE_UPDATE_PAGE_COMPONENTS_TREE) {
          this.setState({
            componentsTree: payload,
          });
        } else if (type === constants.WEBCODESK_MESSAGE_COMPONENT_ITEM_DRAG_START) {
          this.setState({
            draggedItem: payload,
          });
        } else if (type === constants.WEBCODESK_MESSAGE_COMPONENT_ITEM_DRAG_END) {
          this.setState({
            draggedItem: null,
            draggedItemPosition: null,
          });
        } else if (type === constants.WEBCODESK_MESSAGE_COMPONENT_ITEM_DRAG_MOVE) {
          this.setState({
            draggedItemPosition: payload,
          });
        } else if (type === constants.WEBCODESK_MESSAGE_DELETE_PAGE_COMPONENT) {
          window.dispatchEvent(new CustomEvent('selectComponentWrapper', {
            detail: {
              domNode: null
            }
          }));
        }
      }
    }
  }

  itemWasDropped(testItem) {
    sendMessage({
      type: constants.FRAMEWORK_MESSAGE_COMPONENT_ITEM_WAS_DROPPED,
      payload: testItem,
      sourceId: this.iframeId
    });
  }

  handleSelectCell(cellKey) {
    sendMessage({
      type: constants.FRAMEWORK_MESSAGE_PAGE_CELL_WAS_SELECTED,
      payload: {
        targetKey: cellKey,
      },
      sourceId: this.iframeId
    });
  }

  handleContextMenuClick(cellKey) {
    sendMessage({
      type: constants.FRAMEWORK_MESSAGE_CONTEXT_MENU_CLICKED,
      payload: {
        targetKey: cellKey,
      },
      sourceId: this.iframeId
    });
  }

  handleKeyDown(e) {
    if (e) {
      const {keyCode, metaKey, ctrlKey} = e;
      if (metaKey || ctrlKey) {
        if (keyCode === 90) { // Undo
          sendMessage({
            type: constants.FRAMEWORK_MESSAGE_UNDO,
            sourceId: this.iframeId
          });
        } else if (keyCode === 67) { // Copy
          sendMessage({
            type: constants.FRAMEWORK_MESSAGE_COPY,
            sourceId: this.iframeId
          });
        } else if (keyCode === 86) { // Paste
          sendMessage({
            type: constants.FRAMEWORK_MESSAGE_PASTE,
            sourceId: this.iframeId
          });
        } else if (keyCode === 88) { // Cut
          sendMessage({
            type: constants.FRAMEWORK_MESSAGE_CUT,
            sourceId: this.iframeId
          });
        } else if (keyCode === 83) { // Save
          sendMessage({
            type: constants.FRAMEWORK_MESSAGE_SAVE,
            sourceId: this.iframeId
          });
        } else if (keyCode === 82) { // Reload
          sendMessage({
            type: constants.FRAMEWORK_MESSAGE_RELOAD,
            sourceId: this.iframeId
          });
        }
      } else {
        if (keyCode === 8 || keyCode === 46) { // Delete
          sendMessage({
            type: constants.FRAMEWORK_MESSAGE_DELETE,
            sourceId: this.iframeId
          });
        }
      }
    }
    // ctrl + z - Undo
    // 90 + metaKey || ctrlKey
    // ctrl + c - Copy
    // 67 + metaKey || ctrlKey
    // ctrl + v - Paste
    // 86 + metaKey || ctrlKey
    // ctrl + x - Cut
    // 88
    e.stopPropagation();
    e.preventDefault();
  }

  renderPage() {
    const {userComponents} = this.props;
    const {
      componentsTree,
      draggedItem,
      draggedItemPosition
    } = this.state;
    selectedKeys = [];
    return renderComponent(userComponents, componentsTree, {
      itemWasDropped: this.itemWasDropped,
      draggedItem,
      draggedItemPosition,
      onMouseDown: this.handleSelectCell,
      onContextMenuClick: this.handleContextMenuClick,
      onComponentInstanceInitialize: this.handleComponentInstanceInitialize,
      onComponentInstanceDestroy: this.handleComponentInstanceDestroy
    });
  }

  render () {
    let content = this.renderPage();
    if (content) {
      return content;
    }
    return <span />;
  }
}

export default PageComposer;
