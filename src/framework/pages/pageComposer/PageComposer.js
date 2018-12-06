import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import constants from '../../commons/constants';
import pageComponents from './pageComponentIndex';
import ComponentWrapper from "./ComponentWrapper/ComponentWrapper";
import SelectionHandler from './PageCell/SelectionHandler';

let electron;
if (window.require) {
  electron = window.require('electron');
}

// ToDo: remove once the WebpackDevServer fixes HMR - it should preserve React components state (now it does not)
// https://github.com/webpack/webpack-dev-server/issues/1377
// https://github.com/gaearon/react-hot-loader/issues/934
let storeComponentsTree;

const renderComponent = (userComponents, description, serviceComponentOptions) => {
  if (description) {
    const {type, key, props, children} = description;
    if (!type) {
      return null;
    }
    let nestedComponents = [];
    if (children && children.length > 0) {
      nestedComponents = children.map(child => {
        return renderComponent(userComponents, child, serviceComponentOptions);
      });
    }
    console.info('PageComposer try to render: ', type);
    if (type.charAt(0) === '_') {
      const pageComponentType = type.substr(1);
      console.info('PageComposer this is a service component: ', pageComponentType);
      const pageComponent = pageComponents[pageComponentType];
      if (pageComponent) {
        console.info('PageComposer found the service component: ', pageComponent);
        const pageSectionProps = {
          ...props,
          key,
          elementKey: key,
          ...serviceComponentOptions
        };
        return React.createElement(pageComponent, pageSectionProps, nestedComponents);
      }
    } else {
      const component = get(userComponents, type, 'div');
      console.info('PageComposer found a user component: ', component);
      const wrapperProps = {
        key,
        elementKey: key,
        type,
        wrappedProps: props,
        wrappedComponent: component,
      };
      return React.createElement(ComponentWrapper, wrapperProps, nestedComponents);
    }
  }
  return null;
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

    this.handleMultipleSelectionStop = this.handleMultipleSelectionStop.bind(this);
    this.handleMultipleSelection = this.handleMultipleSelection.bind(this);
    this.handleSelectCell = this.handleSelectCell.bind(this);
    this.handleAddMultipleSelectedCell = this.handleAddMultipleSelectedCell.bind(this);
    this.handleRemoveMultipleSelectedCell = this.handleRemoveMultipleSelectedCell.bind(this);
    this.handleCellResize = this.handleCellResize.bind(this);

    this.state = {
      componentsTree: storeComponentsTree || {},
      draggedItem: null,
      pageMultipleSelectionDimensions: null,
      multipleSelectedCells: [],
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
      pageMultipleSelectionDimensions,
      multipleSelectedCells,
    } = this.state;

    return componentsTree !== nextState.componentsTree
      || draggedItem !== nextState.draggedItem
      || pageMultipleSelectionDimensions !== nextState.pageMultipleSelectionDimensions
      || multipleSelectedCells !== nextState.multipleSelectedCells;
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
      } else if(type === 'ITEM_DRAG_START') {
        this.setState({
          draggedItem: payload.label,
        })
      } else if(type === 'ITEM_DRAG_END') {
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
    const {key} = testItem;
    const {draggedItem} = this.state;
    this.sendMessage({
      type: 'ITEM_WAS_DROPPED',
      payload: {
        targetKey: key,
        label: draggedItem,
      }
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

  handleMultipleSelectionStop() {
    this.sendMessage({
      type: constants.FRAMEWORK_MESSAGE_PAGE_MULTIPLE_CELLS_WERE_SELECTED,
      payload: {
        cells: this.state.multipleSelectedCells,
      },
    });
    this.setState({
      pageMultipleSelectionDimensions: null,
    });
  }

  handleMultipleSelection(selectionDimensions) {
    this.setState({
      pageMultipleSelectionDimensions: selectionDimensions,
    });
  }

  handleAddMultipleSelectedCell(cellKey) {
    this.setState((state) => {
      const multipleSelectedCells = [...state.multipleSelectedCells];
      const mergeCellIndex = multipleSelectedCells.indexOf(cellKey);
      if (mergeCellIndex < 0) {
        multipleSelectedCells.push(cellKey);
      }
      return {multipleSelectedCells};
    });
  }

  handleRemoveMultipleSelectedCell(cellKey) {
    this.setState((state) => {
      const multipleSelectedCells = [...state.multipleSelectedCells];
      const cellIndex = multipleSelectedCells.indexOf(cellKey);
      if (cellIndex >= 0) {
        multipleSelectedCells.splice(cellIndex, 1);
      }
      return {multipleSelectedCells};
    });
  }

  handleCellResize(cellKey, newDimensions) {
    console.info('Resizing new dimensions: ', JSON.stringify(newDimensions, null, 2));
    this.sendMessage({
      type: constants.FRAMEWORK_MESSAGE_PAGE_CELL_WAS_RESIZED,
      payload: {
        targetKey: cellKey,
        dimensions: newDimensions,
      },
    });
  }

  renderPage() {
    const {userComponents} = this.props;
    const {
      componentsTree,
      draggedItem,
      pageMultipleSelectionDimensions,
    } = this.state;
    console.info('Render page with components tree: ', componentsTree);
    return renderComponent(userComponents, componentsTree, {
      itemWasDropped: this.itemWasDropped,
      draggedItem,
      pageMultipleSelectionDimensions,
      onSelectCell: this.handleSelectCell,
      onAddMultipleSelectedCell: this.handleAddMultipleSelectedCell,
      onRemoveMultipleSelectedCell: this.handleRemoveMultipleSelectedCell,
      onCellResize: this.handleCellResize,
    });
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
        <SelectionHandler
          onSelectionStop={this.handleMultipleSelectionStop}
          onSelection={this.handleMultipleSelection}
        />
      </div>
    );
  }
}

export default PageComposer;
