import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class ComponentWrapper extends Component {

  constructor (props, content) {
    super(props, content);

    this.initDOMNode = this.initDOMNode.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleNoop = this.handleNoop.bind(this);

  }

  initDOMNode () {
    if (!this.$DOMNode) {
      this.$DOMNode = ReactDOM.findDOMNode(this);
      this.$DOMNode.addEventListener('mousedown', this.handleMouseDown, false);
      this.$DOMNode.addEventListener('mouseover', this.handleMouseOver, false);
      this.$DOMNode.addEventListener('mouseout', this.handleMouseOut, false);
      this.$DOMNode.addEventListener('click', this.handleNoop, false);
      this.$DOMNode.addEventListener('doubleclick', this.handleNoop, false);
      this.$DOMNode.addEventListener('mouseup', this.handleNoop, false);
      // this.$DOMNode.addEventListener('drag', this.handleNoop, false);
      // this.$DOMNode.addEventListener('dragend', this.handleNoop, false);
      // this.$DOMNode.addEventListener('dragenter', this.handleNoop, false);
      // this.$DOMNode.addEventListener('dragexit', this.handleNoop, false);
      // this.$DOMNode.addEventListener('dragleave', this.handleNoop, false);
      // this.$DOMNode.addEventListener('dragover', this.handleNoop, false);
      // this.$DOMNode.addEventListener('dragstart', this.handleNoop, false);
      // this.$DOMNode.addEventListener('drop', this.handleNoop, false);
      this.$DOMNode.addEventListener('contextmenu', this.handleContextMenu, false);
    }
  }

  componentDidMount () {
    this.initDOMNode();
    const { elementKey, isSelected } = this.props;
    if (isSelected) {
      window.dispatchEvent(new CustomEvent('selectComponentWrapper', {detail: {
          elementKey,
          domNode: this.$DOMNode
        }}));
    }
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { elementKey, isSelected } = this.props;
    if (isSelected) {
      window.dispatchEvent(new CustomEvent('selectComponentWrapper', {detail: {
          elementKey,
          domNode: this.$DOMNode
        }}));
    }
  }

  componentWillUnmount () {
    if (this.$DOMNode) {
      this.$DOMNode.removeEventListener('mousedown', this.handleMouseDown);
      this.$DOMNode.removeEventListener('mouseover', this.handleMouseOver);
      this.$DOMNode.removeEventListener('mouseout', this.handleMouseOut);
      this.$DOMNode.removeEventListener('click', this.handleNoop);
      this.$DOMNode.removeEventListener('doubleclick', this.handleNoop);
      this.$DOMNode.removeEventListener('mouseup', this.handleNoop);
      // this.$DOMNode.removeEventListener('drag', this.handleNoop, false);
      // this.$DOMNode.removeEventListener('dragend', this.handleNoop, false);
      // this.$DOMNode.removeEventListener('dragenter', this.handleNoop, false);
      // this.$DOMNode.removeEventListener('dragexit', this.handleNoop, false);
      // this.$DOMNode.removeEventListener('dragleave', this.handleNoop, false);
      // this.$DOMNode.removeEventListener('dragover', this.handleNoop, false);
      // this.$DOMNode.removeEventListener('dragstart', this.handleNoop, false);
      // this.$DOMNode.removeEventListener('drop', this.handleNoop, false);
      this.$DOMNode.removeEventListener('contextmenu', this.handleContextMenu);
    }
    this.$DOMNode = undefined;
  }

  handleMouseDown (e) {
    e.stopPropagation();
    e.preventDefault();
    const {elementKey, onMouseDown} = this.props;
    if (onMouseDown) {
      onMouseDown(elementKey);
    }
  }

  handleContextMenu (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  handleMouseOver (e) {
    const {elementKey} = this.props;
    window.dispatchEvent(new CustomEvent('mouseOverComponentWrapper', {detail: {
      elementKey,
      domNode: this.$DOMNode
    }}));
  }

  handleMouseOut (e) {
    const {elementKey} = this.props;
    window.dispatchEvent(new CustomEvent('mouseOutComponentWrapper', {detail: {
        elementKey,
        domNode: this.$DOMNode,
        remove: true,
      }}));
  }

  handleNoop (e) {
      e.stopPropagation();
      e.preventDefault();
  }

  render () {
    const {wrappedComponent, wrappedProps, children} = this.props;
    return React.createElement(wrappedComponent, wrappedProps, children);
  }
}

export default ComponentWrapper;
