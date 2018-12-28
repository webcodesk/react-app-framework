import React, { Component } from 'react';
import { offset } from './utilities';

const borderRadius = '2px';
const nullPx = '0px';
const px = 'px';
const position = 'absolute';
const borderStyle = 'solid #2979FF';
const borderSize = '2px';

const style = {
  display: 'none'
};

class MouseOverOverlay extends Component {

  constructor (props) {
    super(props);
    this.state = {
      newPos: null,
      border: '' + (props.bSize ? props.bSize : borderSize) + ' ' + (props.bStyle ? props.bStyle : borderStyle)
    };
    this.refreshPosition = this.refreshPosition.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.resetPosition = this.resetPosition.bind(this);
  }

  componentDidMount () {
    window.addEventListener('mouseOverComponentWrapper', this.updatePosition);
    window.addEventListener('mouseOutComponentWrapper', this.updatePosition);
  }

  componentWillUnmount () {
    this.$DOMNode = undefined;
    window.removeEventListener('mouseOverComponentWrapper', this.updatePosition);
    window.removeEventListener('mouseOutComponentWrapper', this.updatePosition);
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const { newPos } = this.state;
    return newPos !== nextState.newPos;
  }

  refreshPosition (position) {
    const $DOMNode = this.$DOMNode;
    if ($DOMNode) {
      const pos = position;
      const newPos = {
        key: pos.key,
        label: pos.label,
        top: pos.top,
        left: pos.left,
        width: pos.width,
        height: pos.height,
      };
      const {newPos: oldPos} = this.state;
      if (!oldPos ||
        newPos.top !== oldPos.top ||
        newPos.left !== oldPos.left ||
        newPos.width !== oldPos.width ||
        newPos.height !== oldPos.height) {
        this.setState({newPos});
      }
    }
  }

  resetPosition () {
    this.$DOMNode = undefined;
    this.setState({newPos: null});
  }

  updatePosition (event) {
    const {detail} = event;
    let targetDOMNode = detail.domNode;

    if (detail.remove) {
      this.resetPosition();
      this.lastPosition = undefined;
    } else {
      if (targetDOMNode) {
        const pos = offset(targetDOMNode);
        const width = pos.right - pos.left;
        const height = pos.bottom - pos.top;
        const newPos = {
          top: pos.top,
          left: pos.left,
          width: width > 0 ? width : 1,
          height: height > 0 ? height : 1,
          label: detail.elementKey,
          key: detail.elementKey
        };
        if (this.$DOMNode && this.lastPosition) {
          if ((newPos.top === this.lastPosition.top && newPos.left > this.lastPosition.left)
            || (newPos.top > this.lastPosition.top && newPos.left === this.lastPosition.left)
            || (newPos.top > this.lastPosition.top && newPos.left > this.lastPosition.left)) {
            this.$DOMNode = targetDOMNode;
            this.lastPosition = newPos;
          }
        } else {
          this.$DOMNode = targetDOMNode;
          this.lastPosition = newPos;
        }
        this.refreshPosition(this.lastPosition);
      }
    }
  }

  render () {
    const {newPos, border} = this.state;
    let content;
    if (newPos && (newPos.width > 1 || newPos.height > 1)) {
      const endPoint = {
        top: newPos.top + px,
        left: newPos.left + px,
        width: '1px',
        height: '1px',
        position: position,
        zIndex: 1040
      };
      const topLine = {
        top: nullPx,
        left: nullPx,
        width: (newPos.width - 1) + 'px',
        height: nullPx,
        position: position,
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
        borderTop: border
      };
      const leftLine = {
        top: nullPx,
        left: nullPx,
        width: nullPx,
        height: (newPos.height - 1) + px,
        position: position,
        borderTopLeftRadius: borderRadius,
        borderBottomLeftRadius: borderRadius,
        borderLeft: border
      };
      const bottomLine = {
        bottom: '-' + (newPos.height - 1) + px,
        left: nullPx,
        width: (newPos.width - 1) + px,
        height: nullPx,
        position: position,
        borderBottomLeftRadius: borderRadius,
        borderBottomRightRadius: borderRadius,
        borderBottom: border
      };
      const rightLine = {
        right: '-' + (newPos.width - 1) + px,
        top: nullPx,
        width: nullPx,
        height: newPos.height + px,
        position: position,
        borderTopRightRadius: borderRadius,
        borderBottomRightRadius: borderRadius,
        borderRight: border
      };
      let labelLine = {
        left: nullPx,
        position: position
      };
      if (newPos.height < 45) {
        labelLine.top = '-15px';
      } else {
        labelLine.top = '0px';
      }
      content = (
        <div style={endPoint}>
          <div style={topLine} />
          <div style={leftLine} />
          <div style={bottomLine} />
          <div style={rightLine} />
        </div>
      );
    } else {
      content = (<span style={style}/>);
    }
    return content;
  }

}

export default MouseOverOverlay;
