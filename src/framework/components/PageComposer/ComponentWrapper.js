import React, {Component} from 'react';
import ReactDOM from 'react-dom';

const style = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
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
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);

  }

  initDOMNode() {
    this.$DOMNode = this.$DOMNode || ReactDOM.findDOMNode(this);
    if (this.$DOMNode) {
      this.$DOMNode.addEventListener('mousedown', this.handleMouseDown, false);
      this.$DOMNode.addEventListener('mouseover', this.handleMouseOver, false);
      this.$DOMNode.addEventListener('mouseout', this.handleMouseOut, false);
      this.$DOMNode.addEventListener('click', this.handleNoop, false);
      this.$DOMNode.addEventListener('doubleclick', this.handleNoop, false);
      this.$DOMNode.addEventListener('mouseup', this.handleNoop, false);
      // this.$DOMNode.addEventListener('drag', this.handleNoop, false);
      // this.$DOMNode.addEventListener('dragend', this.handleNoop, false);
      // this.$DOMNode.addEventListener('dragexit', this.handleNoop, false);
      // this.$DOMNode.addEventListener('dragstart', this.handleNoop, false);
      this.$DOMNode.addEventListener('contextmenu', this.handleContextMenu, false);
      if (!this.props.wrappedComponent) {
        this.$DOMNode.addEventListener('dragenter', this.handleDragEnter, false);
        this.$DOMNode.addEventListener('dragleave', this.handleDragLeave, false);
        this.$DOMNode.addEventListener('dragover', this.handleDragOver, false);
        this.$DOMNode.addEventListener('drop', this.handleDrop, false);
      }
    }
  }

  componentDidMount() {
    this.initDOMNode();
    const {elementKey, isSelected} = this.props;
    if (isSelected) {
      window.dispatchEvent(new CustomEvent('selectComponentWrapper', {
        detail: {
          elementKey,
          domNode: this.$DOMNode
        }
      }));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {elementKey, isSelected} = this.props;
    if (isSelected) {
      window.dispatchEvent(new CustomEvent('selectComponentWrapper', {
        detail: {
          elementKey,
          domNode: this.$DOMNode
        }
      }));
    }
  }

  componentWillUnmount() {
    if (this.$DOMNode) {
      this.$DOMNode.removeEventListener('mousedown', this.handleMouseDown);
      this.$DOMNode.removeEventListener('mouseover', this.handleMouseOver);
      this.$DOMNode.removeEventListener('mouseout', this.handleMouseOut);
      this.$DOMNode.removeEventListener('click', this.handleNoop);
      this.$DOMNode.removeEventListener('doubleclick', this.handleNoop);
      this.$DOMNode.removeEventListener('mouseup', this.handleNoop);
      // this.$DOMNode.removeEventListener('drag', this.handleNoop, false);
      // this.$DOMNode.removeEventListener('dragend', this.handleNoop, false);
      // this.$DOMNode.removeEventListener('dragexit', this.handleNoop, false);
      // this.$DOMNode.removeEventListener('dragstart', this.handleNoop, false);
      this.$DOMNode.removeEventListener('contextmenu', this.handleContextMenu);
      if (!this.props.wrappedComponent) {
        this.$DOMNode.addEventListener('dragenter', this.handleDragEnter, false);
        this.$DOMNode.addEventListener('dragleave', this.handleDragLeave, false);
        this.$DOMNode.addEventListener('dragover', this.handleDragOver, false);
        this.$DOMNode.addEventListener('drop', this.handleDrop, false);
      }
    }
    this.$DOMNode = undefined;
  }

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

  handleDragOver(e) {
    const {isDragOver, isItemAccepting} = this.state;
    if (isDragOver && isItemAccepting) {
      e.preventDefault();
    }
  }

  handleDragEnter(e) {
    const {draggedItem} = this.props;
    if (draggedItem) {
      this.setState({
        isItemAccepting: true,
        isDragOver: true,
      });
    }
  }

  handleDragLeave(e) {
    this.setState({
      isItemAccepting: false,
      isDragOver: false,
    });
  }

  handleDrop(e) {
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
        <pre>
          <code>
            Drag and drop here
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
