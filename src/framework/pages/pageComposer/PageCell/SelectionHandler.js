import debounce from 'lodash/debounce';
import React from 'react';
import PropTypes from 'prop-types';
import { offset } from './utilities';
import { selectionHandlerStyles } from './styles';

class SelectionHandler extends React.Component {
  static propTypes = {
    onSelectionStop: PropTypes.func.isRequired,
    onSelection: PropTypes.func.isRequired,
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
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {isMouseDown, mouseMoveOffsetX, mouseMoveOffsetY} = this.state;
    if (isMouseDown
      && (
        mouseMoveOffsetX !== prevState.mouseMoveOffsetX
        || mouseMoveOffsetY !== prevState.mouseMoveOffsetY
      )
    ) {
      this.debounceOnSelection(offset(this.element));
    }
  }

  debounceOnSelection = debounce(newDimensions => {
    this.props.onSelection(newDimensions);
  }, 5);

  handleMouseMove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const {isMouseDown, mouseDownPositionX, mouseDownPositionY, mouseMoveOffsetX, mouseMoveOffsetY} = this.state;
    if (isMouseDown) {
      const newMouseMoveOffsetY = mouseDownPositionY - e.pageY;
      const newMouseMoveOffsetX = mouseDownPositionX - e.pageX;
      if (Math.abs(newMouseMoveOffsetX - mouseMoveOffsetX) > 5
        || Math.abs(newMouseMoveOffsetY - mouseMoveOffsetY) > 5) {
        this.setState({
          mouseMoveOffsetY: newMouseMoveOffsetY,
          mouseMoveOffsetX: newMouseMoveOffsetX,
        });
      }
    }
  };

  handleMouseUp = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const {isMouseDown} = this.state;
    if (isMouseDown) {
      const {onSelectionStop} = this.props;
      this.setState({
        isMouseDown: false,
        mouseMoveOffsetX: 0,
        mouseMoveOffsetY: 0
      });
      onSelectionStop();
    }
  };

  handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      isMouseDown: true,
      mouseDownPositionX: e.pageX,
      mouseDownPositionY: e.pageY,
    });
  };

  render () {
    const {
      isMouseDown,
      mouseDownPositionX,
      mouseDownPositionY,
      mouseMoveOffsetX,
      mouseMoveOffsetY,
    } = this.state;
    let style;
    if (isMouseDown) {
      style = {...selectionHandlerStyles.resizeBoundariesStyle};
      if (mouseMoveOffsetX > 0 && mouseMoveOffsetY > 0) {
        style.top = mouseDownPositionY - mouseMoveOffsetY;
        style.left = mouseDownPositionX - mouseMoveOffsetX;
        style.width = mouseMoveOffsetX;
        style.height = mouseMoveOffsetY;
      } else if (mouseMoveOffsetX < 0 && mouseMoveOffsetY < 0) {
        style.top = mouseDownPositionY;
        style.left = mouseDownPositionX;
        style.width = -mouseMoveOffsetX;
        style.height = -mouseMoveOffsetY;
      } else if (mouseMoveOffsetX < 0 && mouseMoveOffsetY > 0) {
        style.top = mouseDownPositionY - mouseMoveOffsetY;
        style.left = mouseDownPositionX;
        style.height = mouseMoveOffsetY;
        style.width = -mouseMoveOffsetX;
      } else if (mouseMoveOffsetX > 0 && mouseMoveOffsetY < 0) {
        style.top = mouseDownPositionY;
        style.left = mouseDownPositionX - mouseMoveOffsetX;
        style.height = -mouseMoveOffsetY;
        style.width = mouseMoveOffsetX;
      }
    } else {
      style = selectionHandlerStyles.invisibleBoundariesStyle;
    }
    return (
      <div
        ref={me => this.element = me}
        style={style}
      >
      </div>
    );
  }
}

export default SelectionHandler;
