export const resizingHandlerStyles = {

  /**
   * Horizontal styles
   */

  horizontalStyleTop: {
    position: 'absolute',
    top: '-5px',
    left: '15px',
    right: '15px',
    height: '10px',
    cursor: 'row-resize',
    zIndex: 6,
    border: '1px solid red',
    borderRadius: '4px',
  },

  horizontalStyleBottom: {
    position: 'absolute',
    bottom: '-5px',
    left: '15px',
    right: '15px',
    height: '10px',
    cursor: 'row-resize',
    zIndex: 6,
    border: '1px solid red',
    borderRadius: '4px',
  },

  /**
   * Vertical styles
   */

  verticalStyleRight: {
    position: 'absolute',
    top: '15px',
    right: '-5px',
    bottom: '15px',
    width: '10px',
    cursor: 'col-resize',
    zIndex: 6,
    border: '1px solid red',
    borderRadius: '4px',
  },

  verticalStyleLeft: {
    position: 'absolute',
    top: '15px',
    left: '-5px',
    bottom: '15px',
    width: '10px',
    cursor: 'col-resize',
    zIndex: 6,
    border: '1px solid red',
    borderRadius: '4px',
  },

};

export const multipleSelectionHandlerStyles = {

  /**
   * Horizontal styles
   */

  horizontalStyleTop: {
    position: 'absolute',
    top: '-5px',
    left: '15px',
    right: '15px',
    height: '10px',
    cursor: 'n-resize',
    opacity: 0.5,
    zIndex: 6,
    border: '1px solid red',
    borderRadius: '4px',
  },

  horizontalStyleBottom: {
    position: 'absolute',
    bottom: '-5px',
    left: '15px',
    right: '15px',
    height: '10px',
    cursor: 's-resize',
    opacity: 0.5,
    zIndex: 6,
    border: '1px solid red',
    borderRadius: '4px',
  },

  horizontalStyleTopLeft: {
    position: 'absolute',
    top: '-5px',
    left: '-5px',
    height: '10px',
    width: '10px',
    cursor: 'nw-resize',
    opacity: 0.5,
    zIndex: 8,
    border: '1px solid red',
    borderRadius: '50%',
  },

  horizontalStyleTopRight: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    height: '10px',
    width: '10px',
    cursor: 'ne-resize',
    opacity: 0.5,
    zIndex: 8,
    border: '1px solid red',
    borderRadius: '50%',
  },

  horizontalStyleBottomLeft: {
    position: 'absolute',
    bottom: '-5px',
    left: '-5px',
    height: '10px',
    width: '10px',
    cursor: 'sw-resize',
    opacity: 0.5,
    zIndex: 8,
    border: '1px solid red',
    borderRadius: '50%',
  },

  horizontalStyleBottomRight: {
    position: 'absolute',
    bottom: '-5px',
    right: '-5px',
    height: '10px',
    width: '10px',
    cursor: 'se-resize',
    opacity: 0.5,
    zIndex: 8,
    border: '1px solid red',
    borderRadius: '50%',
  },

  /**
   * Vertical styles
   */

  verticalStyleTop: {
    position: 'absolute',
    top: '15px',
    left: '-5px',
    bottom: '15px',
    width: '10px',
    opacity: 0.5,
    cursor: 'w-resize',
    zIndex: 6,
    border: '1px solid red',
    borderRadius: '4px',
  },

  verticalStyleBottom: {
    position: 'absolute',
    top: '15px',
    right: '-5px',
    bottom: '15px',
    width: '10px',
    opacity: 0.5,
    cursor: 'e-resize',
    zIndex: 6,
    border: '1px solid red',
    borderRadius: '4px',
  },

  resizeBoundariesStyle: {
    position: 'absolute',
    top: '0px',
    left: '0px',
    bottom: '0px',
    right: '0px',
    border: '1px solid #ff6f00',
    zIndex: 10,
  },

};

export const selectionHandlerStyles = {
  resizeBoundariesStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    border: '1px dotted #ff6f00',
    zIndex: 10,
  },

  invisibleBoundariesStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0,
  },

};
