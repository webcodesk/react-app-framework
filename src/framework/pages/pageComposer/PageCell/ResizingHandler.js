import debounce from 'lodash/debounce';
import React from 'react';
import PropTypes from 'prop-types';
import { resizingHandlerStyles } from './styles';

class ResizingHandler extends React.Component {
  static propTypes = {
    isHorizontal: PropTypes.bool,
    isStart: PropTypes.bool,
    onResizing: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isHorizontal: true,
    isStart: true,
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
    const {isStart} = this.props;
    const {isMouseDown, mouseMoveOffsetX, mouseMoveOffsetY} = this.state;
    if (isMouseDown) {
      if (mouseMoveOffsetX > 0
        && prevState.mouseMoveOffsetX > 0
        && mouseMoveOffsetX !== prevState.mouseMoveOffsetX) {
        this.debounceOnResizing({
          offsetX: isStart
            ? mouseMoveOffsetX - prevState.mouseMoveOffsetX
            : prevState.mouseMoveOffsetX - mouseMoveOffsetX,
          offsetY: 0,
        });
      } else if(mouseMoveOffsetY > 0
        && prevState.mouseMoveOffsetY > 0
        && mouseMoveOffsetY !== prevState.mouseMoveOffsetY) {
        this.debounceOnResizing({
          offsetX: 0,
          offsetY: isStart
            ? mouseMoveOffsetY - prevState.mouseMoveOffsetY
            : prevState.mouseMoveOffsetY - mouseMoveOffsetY,
        });
      }
    }
  }

  debounceOnResizing = debounce(newOffsets => {
    this.props.onResizing(newOffsets);
  }, 5);

  handleMouseMove = (e) => {
    const {isHorizontal} = this.props;
    const {isMouseDown} = this.state;
    if (isMouseDown) {
      if (isHorizontal) {
        this.setState({mouseMoveOffsetX: 0, mouseMoveOffsetY: e.pageY});
      } else {
        this.setState({mouseMoveOffsetX: e.pageX, mouseMoveOffsetY: 0});
      }
    }
  };

  handleMouseUp = (e) => {
    const {isMouseDown} = this.state;
    if (isMouseDown) {
      this.setState({
        isMouseDown: false,
        mouseMoveOffsetX: 0,
        mouseMoveOffsetY: 0,
      });
    }
  };

  handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const {isHorizontal} = this.props;
    let newState = {
      isMouseDown: true,
    };
    if (isHorizontal) {
      newState.mouseMoveOffsetX = 0;
      newState.mouseMoveOffsetY = e.pageY;
    } else {
      newState.mouseMoveOffsetX = e.pageX;
      newState.mouseMoveOffsetY = 0;
    }
    this.setState(newState);
  };

  render () {
    const {isHorizontal, isStart} = this.props;
    let style;
    if (isHorizontal) {
      if (isStart) {
        style = resizingHandlerStyles.horizontalStyleTop;
      } else {
        style = resizingHandlerStyles.horizontalStyleBottom;
      }
    } else {
      if (isStart) {
        style = resizingHandlerStyles.verticalStyleLeft;
      } else {
        style = resizingHandlerStyles.verticalStyleRight;
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

export default ResizingHandler;
