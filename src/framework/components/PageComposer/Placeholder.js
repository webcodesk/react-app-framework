import React from 'react';
import PropTypes from 'prop-types';

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


class Placeholder extends React.Component {
  static propTypes = {
    elementKey: PropTypes.string,
    itemWasDropped: PropTypes.func.isRequired,
    draggedItem: PropTypes.object,
  };

  static defaultProps = {
    elementKey: null,
    draggedItem: false,
  };

  constructor (props) {
    super(props);
    this.state = {
      isDragOver: false,
      isItemAccepting: false,
    };

    this.handleItemDragEnter = this.handleItemDragEnter.bind(this);
    this.handleItemDragOver = this.handleItemDragOver.bind(this);
    this.handleItemDragLeave = this.handleItemDragLeave.bind(this);
    this.handleItemDrop = this.handleItemDrop.bind(this);

  }

  handleItemDragOver(e) {
    const {isDragOver, isItemAccepting} = this.state;
    console.info('Dragged Item over: ');
    if (isDragOver && isItemAccepting) {
      e.preventDefault();
    }
  }

  handleItemDragEnter(e) {
    const {draggedItem} = this.props;
    console.info('Dragged Item is entered: ', draggedItem);
    if (draggedItem) {
      this.setState({
        isItemAccepting: true,
        isDragOver: true,
      });
    }
  }

  handleItemDragLeave(e) {
    console.info('Dragged Item leave: ');
    this.setState({
      isItemAccepting: false,
      isDragOver: false,
    });
  }

  handleItemDrop(e) {
    console.info('Dragged Item drop: ');
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

  renderDropZone () {
    const {elementKey, draggedItem} = this.props;
    const {isItemAccepting} = this.state;
    let style = shadowStyle;
    if (isItemAccepting) {
      style = shadowStyleAccepting;
    } else if (draggedItem) {
      style = shadowStyleAcceptable;
    }
    console.info('DropZone is rendering');
    return (
      <div
        key={`DropZone${elementKey}`}
        style={style}
        onDragOver={this.handleItemDragOver}
        onDragEnter={this.handleItemDragEnter}
        onDragLeave={this.handleItemDragLeave}
        onDrop={this.handleItemDrop}
      />
    );
  }

  render() {
    const {elementProperty, elementKey} = this.props;
    if (elementProperty) {
    return (
      <div key={elementKey} style={style}>
        <div>
        <pre>
          <code>
            {elementProperty}
          </code>
        </pre>
        </div>
        {this.renderDropZone()}
      </div>
    );
    }
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

}

export default Placeholder;
