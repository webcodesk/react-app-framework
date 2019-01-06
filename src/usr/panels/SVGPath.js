import React from 'react';
import PropTypes from 'prop-types';

function rightRoundedRect(x, y, width, height, radius) {
  return "M" + x + "," + y
    + "h" + (width - radius)
    + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
    + "v" + (height - 2 * radius)
    + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
    + "h" + (radius - width)
    + "z";
}

function topRoundedRect(x, y, width, height, radius) {
  return "M" + x + "," + y
    + "v" + (radius - height)
    + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius
    + "h" + (width - (2 * radius))
    + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
    + "v" + (height - radius)
    + "z";
}

class SVGPath extends React.Component {
  static propTypes = {
    data: PropTypes.object,
  };

  static defaultProps = {
    data: {},
  };

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div>
        <svg width={500} height={300}>
          <g>
            <path d={topRoundedRect(0, 250, 480, 240, 20)} />
          </g>
        </svg>
        <svg width={500} height={300}>
          <g>
            <path d={rightRoundedRect(0, 0, 480, 240, 20)} />
          </g>
        </svg>

      </div>
    );
  }
}

export default SVGPath;
