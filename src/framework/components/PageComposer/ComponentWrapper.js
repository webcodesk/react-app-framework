import isEqual from 'lodash/isEqual';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { isVisible } from './utilities';

const style = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};

const preStyle = {
  margin: '1em',
};

const shadowStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  borderRadius: '4px',
  border: '1px dashed #dddddd',
  zIndex: 5,
};

const shadowStyleAccepting = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  borderRadius: '4px',
  backgroundColor: '#76FF03',
  zIndex: 5,
  opacity: 0.3,

};

const shadowStyleAcceptable = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  borderRadius: '4px',
  border: '1px dashed #FFC107',
  zIndex: 5,
};

class ComponentWrapper extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isDragOver: false,
      isItemAccepting: false,
    };

    this.initDOMNode = this.initDOMNode.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleNoop = this.handleNoop.bind(this);

    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  initDOMNode() {
    this.$DOMNode = ReactDOM.findDOMNode(this);
    if (this.$DOMNode) {
      this.$DOMNode.addEventListener('mousedown', this.handleMouseDown, false);
      this.$DOMNode.addEventListener('mouseover', this.handleMouseOver, false);
      this.$DOMNode.addEventListener('mouseout', this.handleMouseOut, false);
      this.$DOMNode.addEventListener('click', this.handleNoop, false);
      this.$DOMNode.addEventListener('doubleclick', this.handleNoop, false);
      this.$DOMNode.addEventListener('mouseup', this.handleNoop, false);
      this.$DOMNode.addEventListener('contextmenu', this.handleContextMenu, false);
    }
  }

  clearDOMNode() {
    if (this.$DOMNode) {
      this.$DOMNode.removeEventListener('mousedown', this.handleMouseDown);
      this.$DOMNode.removeEventListener('mouseover', this.handleMouseOver);
      this.$DOMNode.removeEventListener('mouseout', this.handleMouseOut);
      this.$DOMNode.removeEventListener('click', this.handleNoop);
      this.$DOMNode.removeEventListener('doubleclick', this.handleNoop);
      this.$DOMNode.removeEventListener('mouseup', this.handleNoop);
      this.$DOMNode.removeEventListener('contextmenu', this.handleContextMenu);
    }
    this.$DOMNode = undefined;
  }

  componentDidMount() {
    this.initDOMNode();
    const { elementKey, onComponentInstanceInitialize } = this.props;
    if (onComponentInstanceInitialize) {
      onComponentInstanceInitialize(elementKey, this);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {draggedItem, draggedItemPosition, wrappedComponent} = this.props;
    if (!wrappedComponent) {
      if (
        draggedItem && draggedItemPosition
        && (
          !prevProps.draggedItemPosition
          || (
            draggedItemPosition !== prevProps.draggedItemPosition
            && !isEqual(draggedItemPosition, prevProps.draggedItemPosition)
          )
        )
      ) {
        const pos = this.$DOMNode.getBoundingClientRect();
        if (
          draggedItemPosition.top > pos.top
          && draggedItemPosition.top < pos.bottom
          && draggedItemPosition.left > pos.left
          && draggedItemPosition.left < pos.right
        ) {
          this.handleDragEnter();
        } else {
          this.handleDragLeave();
        }
      } else if (!draggedItem && !draggedItemPosition && prevProps.draggedItem && prevProps.draggedItemPosition) {
        this.handleDrop();
      }
    }
  }

  componentWillUnmount() {
    this.clearDOMNode();
    const { elementKey, onComponentInstanceDestroy } = this.props;
    if (onComponentInstanceDestroy) {
      onComponentInstanceDestroy(elementKey, this);
    }
  }

  selectComponent () {
    const {elementKey} = this.props;
    if (isVisible(this.$DOMNode)) {
      window.dispatchEvent(new CustomEvent('selectComponentWrapper', {
        detail: {
          elementKey,
          domNode: this.$DOMNode
        }
      }));
    }
  };

  handleMouseDown(e) {
    e.stopPropagation();
    e.preventDefault();
    const {elementKey, onMouseDown} = this.props;
    if (onMouseDown) {
      onMouseDown(elementKey);
    }
  }

  handleContextMenu(e) {
    e.stopPropagation();
    e.preventDefault();
    const {elementKey, onContextMenuClick} = this.props;
    if (onContextMenuClick) {
      onContextMenuClick(elementKey);
    }
  }

  handleMouseOver(e) {
    const {elementKey} = this.props;
    window.dispatchEvent(new CustomEvent('mouseOverComponentWrapper', {
      detail: {
        elementKey,
        domNode: this.$DOMNode
      }
    }));
  }

  handleMouseOut(e) {
    const {elementKey} = this.props;
    window.dispatchEvent(new CustomEvent('mouseOutComponentWrapper', {
      detail: {
        elementKey,
        domNode: this.$DOMNode,
        remove: true,
      }
    }));
  }

  handleDragEnter() {
    const {draggedItem} = this.props;
    if (draggedItem) {
      this.setState({
        isItemAccepting: true,
        isDragOver: true,
      });
    }
  }

  handleDragLeave() {
    this.setState({
      isItemAccepting: false,
      isDragOver: false,
    });
  }

  handleDrop() {
    const {elementKey, itemWasDropped, draggedItem} = this.props;
    const {isItemAccepting, isDragOver} = this.state;
    if (isItemAccepting && isDragOver && itemWasDropped) {
      itemWasDropped({
        destination: {
          key: elementKey,
        },
        source: draggedItem,
      });
      this.setState({
        isItemAccepting: false,
        isDragOver: false,
      });
    }
  }

  handleNoop(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  renderDropZone () {
    const {elementKey, draggedItem} = this.props;
    const {isItemAccepting} = this.state;
    let style = shadowStyle;
    if (isItemAccepting) {
      style = shadowStyleAccepting;
    } else if (draggedItem) {
      style = shadowStyleAcceptable;
    }
    return (
      <div
        key={`DropZone${elementKey}`}
        style={style}
      />
    );
  }

  render() {
    const {elementKey, wrappedComponent, wrappedProps, children} = this.props;
    if (!wrappedComponent) {
      return (
        <div key={elementKey} style={style}>
          <div>
        <pre style={preStyle}>
          <code>
            &oplus;
          </code>
        </pre>
          </div>
          {this.renderDropZone()}
        </div>
      );
    }
    return React.createElement(wrappedComponent, wrappedProps, children);
  }
}

export default ComponentWrapper;
