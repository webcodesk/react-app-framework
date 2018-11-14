import React from 'react';
import PropTypes from 'prop-types';
import { Cell } from 'styled-css-grid';
import ResizingHandler from './ResizingHandler';
import { offset } from './utilities';

const shadowStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  borderTop: '1px dashed #cfd8dc',
  borderLeft: '1px dashed #cfd8dc',
  borderRight: '1px dashed #cfd8dc',
  borderBottom: '1px dashed #cfd8dc',
  zIndex: 5,
};

const shadowStyleAcceptable = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  boxShadow: 'inset 0 0 10px green',
  zIndex: 5,
};

const shadowStyleSelectable = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  boxShadow: 'inset 0 0 10px blue',
  zIndex: 5,
};

const shadowStyleSelected = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  boxShadow: 'inset 0 0 10px brown',
  zIndex: 5,
};

const shadowStyleMultipleSelected = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  boxShadow: 'inset 0 0 10px orange',
  zIndex: 5,
};

export const gridMarkerStyles = {
  heightMarker: {
    position: 'absolute',
    top: '5px',
    left: '-15px',
    opacity: 0.5,
    zIndex: 6,
    border: '1px solid red',
    borderRadius: '4px',
    padding: '3px',
  }
};

class PageCell extends React.Component {
  static propTypes = {
    elementKey: PropTypes.string,
    itemWasDropped: PropTypes.func.isRequired,
    draggedItem: PropTypes.string,
    pageMultipleSelectionDimensions: PropTypes.object,
    onSelectCell: PropTypes.func,
    onAddMultipleSelectedCell: PropTypes.func,
    onRemoveMultipleSelectedCell: PropTypes.func,
    onCellResize: PropTypes.func,
  };

  static defaultProps = {
    elementKey: null,
    draggedItem: false,
  };

  constructor (props) {
    super(props);

    this.handleItemDragEnter = this.handleItemDragEnter.bind(this);
    this.handleItemDragOver = this.handleItemDragOver.bind(this);
    this.handleItemDragLeave = this.handleItemDragLeave.bind(this);
    this.handleItemDrop = this.handleItemDrop.bind(this);

    this.handleClick = this.handleClick.bind(this);
    this.handleAvailableToSelect = this.handleAvailableToSelect.bind(this);
    this.handleCellResize = this.handleCellResize.bind(this);

    this.state = {
      isDragOver: false,
      isItemAcceptable: false,
      isAvailableToSelect: false,
    };

  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   const {pageMultipleSelectionDimensions, draggedItem} = this.props;
  //   const {isAvailableToSelect, isDragOver, isItemAcceptable} = this.state;
  //   return pageMultipleSelectionDimensions !== nextProps.pageMultipleSelectionDimensions
  //     || draggedItem !== nextProps.draggedItem
  //     || isAvailableToSelect !== nextState.isAvailableToSelect
  //     || isItemAcceptable !== nextState.isItemAcceptable
  //     || isDragOver !== nextState.isDragOver;
  // }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const {pageMultipleSelectionDimensions} = this.props;
    const {isAvailableToSelect} = this.state;
    if (
      pageMultipleSelectionDimensions
      && pageMultipleSelectionDimensions !== prevProps.pageMultipleSelectionDimensions
    ) {
      const {top, left, right, bottom} = offset(this.zoneElement);
      if (
        // The dimensions completely cover the element
        left >= pageMultipleSelectionDimensions.left && right <= pageMultipleSelectionDimensions.right
        && top >= pageMultipleSelectionDimensions.top && bottom <= pageMultipleSelectionDimensions.bottom
      ) {
        this.setState({
          isAvailableToSelect: true,
        });
        // Uncomment this if the selection should be triggered when the dimensions intersect the element
      } else if (
        (
          // Top line intersects the element
          (top <= pageMultipleSelectionDimensions.top && bottom >= pageMultipleSelectionDimensions.top)
          &&
          (left >= pageMultipleSelectionDimensions.left && right <= pageMultipleSelectionDimensions.right)
        )
        ||
        (
          // Bottom line intersects the element
          (bottom >= pageMultipleSelectionDimensions.bottom && top <= pageMultipleSelectionDimensions.bottom)
          &&
          (left >= pageMultipleSelectionDimensions.left && right <= pageMultipleSelectionDimensions.right)
        )
        ||
        (
          // Left line intersects the element
          (left <= pageMultipleSelectionDimensions.left && right >= pageMultipleSelectionDimensions.left)
          &&
          (top >= pageMultipleSelectionDimensions.top && bottom <= pageMultipleSelectionDimensions.bottom)
        )
        ||
        (
          // Right line intersects the element
          (right >= pageMultipleSelectionDimensions.right && left <= pageMultipleSelectionDimensions.right)
          &&
          (top >= pageMultipleSelectionDimensions.top && bottom <= pageMultipleSelectionDimensions.bottom)
        )
        ||
        (
          // Top Left corner
          (top <= pageMultipleSelectionDimensions.top && bottom >= pageMultipleSelectionDimensions.top)
          &&
          (left <= pageMultipleSelectionDimensions.left && right >= pageMultipleSelectionDimensions.left)
        )
        ||
        (
          // Bottom Left corner
          (bottom >= pageMultipleSelectionDimensions.bottom && top <= pageMultipleSelectionDimensions.bottom)
          &&
          (left <= pageMultipleSelectionDimensions.left && right >= pageMultipleSelectionDimensions.left)
        )
        ||
        (
          // Top Right corner
          (top <= pageMultipleSelectionDimensions.top && bottom >= pageMultipleSelectionDimensions.top)
          &&
          (right >= pageMultipleSelectionDimensions.right && left <= pageMultipleSelectionDimensions.right)
        )
        ||
        (
          // Bottom Right corner
          (bottom >= pageMultipleSelectionDimensions.bottom && top <= pageMultipleSelectionDimensions.bottom)
          &&
          (right >= pageMultipleSelectionDimensions.right && left <= pageMultipleSelectionDimensions.right)
        )
      ) {
        this.setState({
          isAvailableToSelect: true,
        });
      } else {
        this.setState({
          isAvailableToSelect: false,
        });
      }
    } else if (!pageMultipleSelectionDimensions && prevProps.pageMultipleSelectionDimensions) {
      this.setState({
        isAvailableToSelect: false,
      });
    } else if (isAvailableToSelect !== prevState.isAvailableToSelect) {
      this.handleAvailableToSelect(isAvailableToSelect);
    }
  }

  handleItemDragOver (e) {
    const {isDragOver, isItemAcceptable} = this.state;
    if (isDragOver && isItemAcceptable) {
      e.preventDefault();
    }
  }

  handleItemDragEnter (e) {
    const {draggedItem} = this.props;
    if (draggedItem) {
      this.setState({
        isItemAcceptable: true,
        isDragOver: true,
      });
    }
  }

  handleItemDragLeave (e) {
    this.setState({
      isItemAcceptable: false,
      isDragOver: false,
    });
  }

  handleItemDrop (e) {
    const {elementKey, itemWasDropped} = this.props;
    const {isItemAcceptable, isDragOver} = this.state;
    if (isItemAcceptable && isDragOver && itemWasDropped) {
      itemWasDropped({
        key: elementKey,
      });
      this.setState({
        isItemAcceptable: false,
        isDragOver: false,
      });
    }
  }

  handleClick (e) {
    e.stopPropagation();
    e.preventDefault();
    const {elementKey, onSelectCell} = this.props;
    onSelectCell(elementKey);
  }

  handleAvailableToSelect (isAvailableToSelect) {
    const {elementKey, onAddMultipleSelectedCell, onRemoveMultipleSelectedCell} = this.props;
    if (isAvailableToSelect) {
      onAddMultipleSelectedCell(elementKey);
    } else {
      onRemoveMultipleSelectedCell(elementKey);
    }
  }

  handleCellResize (offsets) {
    const { elementKey, onCellResize } = this.props;
    const { top, left, right, bottom } = offset(this.zoneElement);
    const { offsetX, offsetY } = offsets;
    const cellDimensions = {
      height: -1,
      width: -1,
    };
    if (offsetY !== 0) {
      const newHeight = (bottom - top) - offsetY;
      if (newHeight > 0) {
        cellDimensions.height = newHeight;
      }
    }
    if (offsetX !== 0) {
      const newWidth = (right - left) - offsetX;
      if (newWidth > 0) {
        cellDimensions.width = newWidth;
      }
    }
    onCellResize(elementKey, cellDimensions);
  }

  renderDropZone () {
    const {elementKey, isSelected, isMultipleSelected} = this.props;
    const {isItemAcceptable, isAvailableToSelect} = this.state;
    let style;
    if (isItemAcceptable) {
      style = shadowStyleAcceptable;
    } else if (isAvailableToSelect) {
      style = shadowStyleSelectable;
    } else if (isSelected) {
      style = shadowStyleSelected;
    } else if (isMultipleSelected) {
      style = shadowStyleMultipleSelected;
    } else {
      style = shadowStyle;
    }
    return (
      <div
        key={`Cell_${elementKey}`}
        ref={me => this.zoneElement = me}
        style={style}
        onDragOver={this.handleItemDragOver}
        onDragEnter={this.handleItemDragEnter}
        onDragLeave={this.handleItemDragLeave}
        onDrop={this.handleItemDrop}
        onClick={this.handleClick}
      />
    );
  }

  render () {
    const {children, style, isSelected, elementKey, top, left, height} = this.props;
    console.info('Cell is rendering: ', elementKey);
    return (
      <Cell
        key={elementKey}
        {...this.props}
        style={{...{position: 'relative'}, ...style}}
      >
        {children.length > 0
          ? children
          : (
            <p style={{textAlign: 'center'}}>
              {top}&nbsp;:&nbsp;{left}
            </p>
          )
        }
        {this.renderDropZone()}
        {isSelected &&
        <div style={{overflow: 'hidden'}}>
          <ResizingHandler onResizing={this.handleCellResize} isStart={false} />
          <ResizingHandler onResizing={this.handleCellResize} isHorizontal={false} isStart={false} />
          <ResizingHandler onResizing={this.handleCellResize} isHorizontal={false} />
          <ResizingHandler onResizing={this.handleCellResize} />
        </div>
        }
      </Cell>

    );
  }
}

export default PageCell;
