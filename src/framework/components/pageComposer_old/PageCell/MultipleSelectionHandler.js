import debounce from 'lodash/debounce';
import React from 'react';
import PropTypes from 'prop-types';
import { offset } from './utilities';
import { multipleSelectionHandlerStyles } from './styles';

const resizeDimensionsOffset = 0;

class MultipleSelectionHandler extends React.Component {
  static propTypes = {
    isHorizontal: PropTypes.bool,
    isBottom: PropTypes.bool,
    markerPosition: PropTypes.string,
    onResize: PropTypes.func.isRequired,
    elementKey: PropTypes.string,
  };

  static defaultProps = {
    isHorizontal: true,
    isBottom: true,
    markerPosition: 'middle',
  };

  constructor (props) {
    super(props);
    this.state = {
      isMouseDown: false,
      mouseDownPositionX: 0,
      mouseDownPositionY: 0,
      mouseMoveOffsetX: 0,
      mouseMoveOffsetY: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      isMouseDown,
      mouseMoveOffsetX,
      mouseMoveOffsetY,
      top: ctop,
      left: cleft,
      right: cright,
      bottom: cbottom
    } = this.state;
    if (isMouseDown
      && (
        mouseMoveOffsetX !== prevState.mouseMoveOffsetX
        || mouseMoveOffsetY !== prevState.mouseMoveOffsetY
      )
    ) {
      this.debounceOnSelection();
    }
  }

  debounceOnSelection = debounce(() => {
    this.props.onResize(offset(this.element));
  }, 5);

  handleMouseMove = (e) => {
    // e.stopPropagation();
    // e.preventDefault();
    const {isHorizontal, isBottom, markerPosition} = this.props;
    const {isMouseDown, mouseDownPositionX, mouseDownPositionY} = this.state;
    if (isMouseDown) {
      let newState = {};
      const moveDownY = mouseDownPositionY - e.pageY;
      const moveUpY = e.pageY - mouseDownPositionY;
      const moveLeftX = mouseDownPositionX - e.pageX;
      const moveRightX = e.pageX - mouseDownPositionX;
      if (isHorizontal) {
        if (markerPosition === 'middle') {
          if (isBottom) {
            newState.mouseMoveOffsetY = moveDownY;
          } else {
            newState.mouseMoveOffsetY = moveUpY;
          }
        } else if (markerPosition === 'start') {
          if (isBottom) {
            newState.mouseMoveOffsetY = moveDownY;
          } else {
            newState.mouseMoveOffsetY = moveUpY;
          }
          newState.mouseMoveOffsetX = moveRightX;
        } else if (markerPosition === 'end') {
          if (isBottom) {
            newState.mouseMoveOffsetY = moveDownY;
          } else {
            newState.mouseMoveOffsetY = moveUpY;
          }
          newState.mouseMoveOffsetX = moveLeftX;
        }
      } else {
        if (markerPosition === 'middle') {
          if (isBottom) {
            newState.mouseMoveOffsetX = moveLeftX;
          } else {
            newState.mouseMoveOffsetX = moveRightX;
          }
        }
      }
      this.setState(newState);
    }
  };

  handleMouseUp = (e) => {
    // e.stopPropagation();
    // e.preventDefault();
    console.info('Mouse up: ....');
    const {isMouseDown} = this.state;
    if (isMouseDown) {
      this.setState({
        isMouseDown: false,
        mouseMoveOffsetX: 0,
        mouseMoveOffsetY: 0
      });
    }
  };

  handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const {isHorizontal, isBottom, markerPosition, onSelectionStart} = this.props;
    const {top, left, bottom, right} = offset(this.element);
    let newState = {
      isMouseDown: true,
      top,
      left,
      bottom,
      right,
    };
    if (isHorizontal) {
      if (markerPosition === 'middle') {
        if (isBottom) {
          newState.mouseDownPositionY = bottom;
        } else {
          newState.mouseDownPositionY = top;
        }
      } else if (markerPosition === 'start') {
        if (isBottom) {
          newState.mouseDownPositionY = bottom;
        } else {
          newState.mouseDownPositionY = top;
        }
        newState.mouseDownPositionX = left;
      } else if (markerPosition === 'end') {
        if (isBottom) {
          newState.mouseDownPositionY = bottom;
        } else {
          newState.mouseDownPositionY = top;
        }
        newState.mouseDownPositionX = right;
      }
    } else {
      if (markerPosition === 'middle') {
        if (isBottom) {
          newState.mouseDownPositionX = right;
        } else {
          newState.mouseDownPositionX = left;
        }
      }
    }
    newState.mouseMoveOffsetX = resizeDimensionsOffset;
    newState.mouseMoveOffsetY = resizeDimensionsOffset;
    this.setState(newState);
    // onSelectionStart();
  };

  render () {
    const {isHorizontal, isBottom, markerPosition, elementKey} = this.props;
    const {isMouseDown, mouseMoveOffsetX, mouseMoveOffsetY} = this.state;
    let style;
    if (isMouseDown) {
      style = {...multipleSelectionHandlerStyles.resizeBoundariesStyle};
      if (isHorizontal) {
        if (markerPosition === 'middle') {
          if (isBottom) {
            style.bottom = mouseMoveOffsetY;
          } else {
            style.top = mouseMoveOffsetY;
          }
          style.cursor = 'row-resize';
        } else if (markerPosition === 'start') {
          if (isBottom) {
            style.bottom = mouseMoveOffsetY;
          } else {
            style.top = mouseMoveOffsetY;
          }
          style.left = mouseMoveOffsetX;
        } else if (markerPosition === 'end') {
          if (isBottom) {
            style.bottom = mouseMoveOffsetY;
          } else {
            style.top = mouseMoveOffsetY;
          }
          style.right = mouseMoveOffsetX;
        }
      } else {
        if (markerPosition === 'middle') {
          if (isBottom) {
            style.right = mouseMoveOffsetX;
          } else {
            style.left = mouseMoveOffsetX;
          }
          style.cursor = 'col-resize';
        }
      }
    } else {
      if (isHorizontal) {
        if (markerPosition === 'middle') {
          if (isBottom) {
            style = multipleSelectionHandlerStyles.horizontalStyleBottom;
          } else {
            style = multipleSelectionHandlerStyles.horizontalStyleTop;
          }
        } else if (markerPosition === 'start') {
          if (isBottom) {
            style = multipleSelectionHandlerStyles.horizontalStyleBottomLeft;
          } else {
            style = multipleSelectionHandlerStyles.horizontalStyleTopLeft;
          }
        } else if (markerPosition === 'end') {
          if (isBottom) {
            style = multipleSelectionHandlerStyles.horizontalStyleBottomRight;
          } else {
            style = multipleSelectionHandlerStyles.horizontalStyleTopRight;
          }
        }
      } else {
        if (markerPosition === 'middle') {
          if (isBottom) {
            style = multipleSelectionHandlerStyles.verticalStyleBottom;
          } else {
            style = multipleSelectionHandlerStyles.verticalStyleTop;
          }
        }
      }
    }
    return (
      <div
        ref={me => this.element = me}
        style={style}
        onMouseDown={this.handleMouseDown}
      >
      </div>
    );
  }
}

export default MultipleSelectionHandler;
