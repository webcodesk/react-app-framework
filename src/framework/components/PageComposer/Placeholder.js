import React from 'react';
import PropTypes from 'prop-types';

const style = {
  width: '100%',
  height: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  borderRadius: '4px',
  boxShadow: 'inset 0px 0px 2px 1px #FFE082',
};

const styleAcceptable = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  borderRadius: '4px',
  backgroundColor: '#FFF8E1',
  boxShadow: 'inset 0px 0px 2px 1px #FFE082',
};

const styleRootPlaceholder = {
  width: '100%',
  height: '200px',
  backgroundColor: '#dddddd',
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
  zIndex: 5,
};

const shadowStyleAccepting = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  borderRadius: '4px',
  // backgroundColor: '#DCEDC8',
  boxShadow: 'inset 0px 0px 4px 1px #81C784',
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
      isItemAcceptable: false,
    };

    this.handleItemDragEnter = this.handleItemDragEnter.bind(this);
    this.handleItemDragOver = this.handleItemDragOver.bind(this);
    this.handleItemDragLeave = this.handleItemDragLeave.bind(this);
    this.handleItemDrop = this.handleItemDrop.bind(this);

  }

  handleItemDragOver(e) {
    const {isDragOver, isItemAcceptable} = this.state;
    console.info('Dragged Item over: ');
    if (isDragOver && isItemAcceptable) {
      e.preventDefault();
    }
  }

  handleItemDragEnter(e) {
    const {draggedItem} = this.props;
    console.info('Dragged Item is entered: ', draggedItem);
    if (draggedItem) {
      this.setState({
        isItemAcceptable: true,
        isDragOver: true,
      });
    }
  }

  handleItemDragLeave(e) {
    console.info('Dragged Item leave: ');
    this.setState({
      isItemAcceptable: false,
      isDragOver: false,
    });
  }

  handleItemDrop(e) {
    console.info('Dragged Item drop: ');
    const {elementKey, itemWasDropped, draggedItem} = this.props;
    const {isItemAcceptable, isDragOver} = this.state;
    if (isItemAcceptable && isDragOver && itemWasDropped) {
      itemWasDropped({
        destination: {
          key: elementKey,
        },
        source: draggedItem,
      });
      this.setState({
        isItemAcceptable: false,
        isDragOver: false,
      });
    }
  }

  renderDropZone () {
    const {elementKey} = this.props;
    const {isItemAcceptable} = this.state;
    let style;
    if (isItemAcceptable) {
      style = shadowStyleAccepting;
    } else {
      style = shadowStyle;
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
    const {elementProperty, elementKey, draggedItem} = this.props;
    if (elementProperty) {
    return (
      <div key={elementKey} style={draggedItem ? styleAcceptable : style}>
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
      <div key={elementKey} style={styleRootPlaceholder}>
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
