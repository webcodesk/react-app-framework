import React from 'react';
import PropTypes from 'prop-types';

class ViewPanel extends React.Component {
  static propTypes = {
    firstDataString: PropTypes.string,
    secondDataString: PropTypes.string,
    thirdDataString: PropTypes.string,
  };

  static defaultProps = {
    firstDataString: 'not set',
    secondDataString: 'not set',
    thirdDataString: 'not set',
  };

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div>
        <h1>View Panel</h1>
        <h3>First string: {this.props.firstDataString}</h3>
        <h3>Second string: {this.props.secondDataString}</h3>
        <h3>Third string: {this.props.thirdDataString}</h3>
      </div>
    );
  }
}

export default ViewPanel;
