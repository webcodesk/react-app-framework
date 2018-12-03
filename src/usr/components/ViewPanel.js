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
    this.state = {
      stateProbeValue: 'Default Probe Value',
    }
  }

  handleChangeState = () => {
    this.setState({
      stateProbeValue: 'Changed Probe Value',
    });
  };

  render () {
    const { stateProbeValue } = this.state;
    return (
      <div>
        <h1>View Panel</h1>
        <h3>First string: {this.props.firstDataString}</h3>
        <h3>Second string: {this.props.secondDataString}</h3>
        <h3>Third string: {this.props.thirdDataString}</h3>
        <button onClick={this.handleChangeState}>Change State</button>
        <h3>State: {stateProbeValue}</h3>
      </div>
    );
  }
}

export default ViewPanel;
