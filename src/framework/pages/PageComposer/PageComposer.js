import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import constants from '../../commons/constants';
import ComponentWrapper from "./ComponentWrapper";
import Placeholder from './Placeholder';
import NotFoundComponent from './NotFoundComponent';

let electron;
if (window.require) {
  electron = window.require('electron');
}

// ToDo: remove once the WebpackDevServer fixes HMR - it should preserve React components state (now it does not)
// https://github.com/webpack/webpack-dev-server/issues/1377
// https://github.com/gaearon/react-hot-loader/issues/934
let storeComponentsTree;

const renderComponent = (userComponents, description, serviceComponentOptions) => {
  const result = {};
  if (description) {
    const {type, key, props, children} = description;
    if (!type || !props) {
      return result;
    }
    const { componentName, elementProperty } = props;

    result.key = elementProperty;

    console.info('PageComposer try to render: ', type);
    if (type === 'pagePlaceholder') {
      const placeholderProps = {
        ...props,
        key,
        elementKey: key,
        text: elementProperty,
        ...serviceComponentOptions
      };
      result.value = React.createElement(Placeholder, placeholderProps);
    } else if (type === 'pageComponent') {
      let propsComponents = {};
      if (children && children.length > 0) {
        children.forEach(child => {
          const { key, value } = renderComponent(userComponents, child, serviceComponentOptions);
          if (key) {
            propsComponents[key] = value;
          }
        });
      }
      const component = get(userComponents, componentName, NotFoundComponent);
      console.info('PageComposer found a user component: ', component);
      const wrapperProps = {
        key,
        wrappedProps: propsComponents,
        wrappedComponent: component,
      };
      result.value = React.createElement(ComponentWrapper, wrapperProps);
    }
  }
  return result;
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
  }

  componentWillUnmount() {
    if (electron) {
      electron.ipcRenderer.removeListener('message', this.handleReceiveMessage);
    }
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
    console.info('[Framework] PageComposer received message: ', event, message);
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
      }
    }
  }

  sendMessage(message) {
    if (message) {
      console.info('[Framework] PageComposer sending message: ', message);
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
    console.info('Render page with components tree: ', componentsTree);
    const rootComponent = renderComponent(userComponents, componentsTree, {
      itemWasDropped: this.itemWasDropped,
      draggedItem,
      onSelectCell: this.handleSelectCell,
    });
    return rootComponent.value;
  }

  renderElectronError() {
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '450px'}}>
        <div>
          <h3>Works only in Electron</h3>
        </div>
      </div>
    );
  }

  render () {
    let content = electron ? this.renderPage() : this.renderElectronError();
    return (
      <div style={{position: 'relative'}}>
        {content}
      </div>
    );
  }
}

export default PageComposer;
