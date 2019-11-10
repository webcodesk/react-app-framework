import isEqual from 'lodash/isEqual';
import { offset } from './utilities';

let startPoint;
let topLine;
let leftLine;
let rightLine;
let bottomLine;

let boundaries = [];

let lastPosition;

export function initElements() {
  const rootElement = document.body;
  if (rootElement) {
    startPoint = document.createElement('div');
    rootElement.append(startPoint);
    topLine = document.createElement('div');
    startPoint.append(topLine);
    leftLine = document.createElement('div');
    startPoint.append(leftLine);
    rightLine = document.createElement('div');
    startPoint.append(rightLine);
    bottomLine = document.createElement('div');
    startPoint.append(bottomLine);
    boundaries = [
      topLine, leftLine, rightLine, bottomLine, startPoint
    ];
    hideBoundaries();
    window.addEventListener('mouseOverComponentWrapper', updatePosition);
    window.addEventListener('mouseOutComponentWrapper', updatePosition);
  }
}

export function destroyElements() {
  window.removeEventListener('mouseOverComponentWrapper', updatePosition);
  window.removeEventListener('mouseOutComponentWrapper', updatePosition);
  boundaries.forEach(item => {
    if (item) {
      item.remove();
    }
  });
  boundaries = undefined;
}

function updatePosition(event) {
  const {detail} = event;
  if (detail.remove) {
    hideBoundaries();
  } else if (detail.domNode) {
    let targetDOMNode = detail.domNode;
    const pos = offset(targetDOMNode);
    const width = pos.right - pos.left;
    const height = pos.bottom - pos.top;
    const newPos = {
      top: pos.top,
      left: pos.left,
      width: width > 0 ? width : 1,
      height: height > 0 ? height : 1,
    };
    if (lastPosition) {
      if (!isEqual(lastPosition, newPos) && ((newPos.top === lastPosition.top && newPos.left > lastPosition.left)
        || (newPos.top > lastPosition.top && newPos.left === lastPosition.left)
        || (newPos.top > lastPosition.top && newPos.left > lastPosition.left))) {
        lastPosition = newPos;
        showBoundaries(newPos);
      }
    } else {
      lastPosition = newPos;
      showBoundaries(newPos);
    }
  }
}

function hideBoundaries() {
  boundaries.forEach(item => {
    if (item) {
      item.style.display = 'none';
    }
  });
  lastPosition = null;
}

const borderStyle = '1px solid #2979FF';
const borderRadius = '2px';

function showBoundaries(position) {
  boundaries.forEach(item => {
    if (item) {
      item.style.display = 'block';
    }
  });
  if (startPoint) {
    startPoint.style.top = `${position.top}px`;
    startPoint.style.left = `${position.left}px`;
    startPoint.style.width = '1px';
    startPoint.style.height = '1px';
    startPoint.style.position = 'absolute';
    startPoint.style.display = 'block';
    startPoint.style.zIndex = 999999999;
    if (topLine) {
      topLine.style.position = 'absolute';
      topLine.style.top = '0px';
      topLine.style.left = '0px';
      topLine.style.width = `${position.width - 1}px`;
      topLine.style.height = '0px';
      topLine.style.borderTopLeftRadius = borderRadius;
      topLine.style.borderTopLeftRadius = borderRadius;
      topLine.style.borderTop = borderStyle;
    }
    if (leftLine) {
      leftLine.style.position = 'absolute';
      leftLine.style.top = '0px';
      leftLine.style.left = '0px';
      leftLine.style.width = '0px';
      leftLine.style.height = `${position.height - 1}px`;
      leftLine.style.borderTopLeftRadius = borderRadius;
      leftLine.style.borderBottomLeftRadius = borderRadius;
      leftLine.style.borderLeft = borderStyle;
    }
    if (rightLine) {
      rightLine.style.position = 'absolute';
      rightLine.style.right = `-${position.width - 1}px`;
      rightLine.style.top = '0px';
      rightLine.style.width = '0px';
      rightLine.style.height = `${position.height}px`;
      rightLine.style.borderTopRightRadius = borderRadius;
      rightLine.style.borderBottomRightRadius = borderRadius;
      rightLine.style.borderRight = borderStyle;
    }
    if (bottomLine) {
      bottomLine.style.position = 'absolute';
      bottomLine.style.bottom = `-${position.height - 1}px`;
      bottomLine.style.left = '0px';
      bottomLine.style.width = `${position.width - 1}px`;
      bottomLine.style.height = '0px';
      bottomLine.style.borderBottomLeftRadius = borderRadius;
      bottomLine.style.borderBottomRightRadius = borderRadius;
      bottomLine.style.borderBottom = borderStyle;
    }
  }
}