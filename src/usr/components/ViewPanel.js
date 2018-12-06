import React from 'react';
import PropTypes from 'prop-types';

class ViewPanel extends React.Component {
  static propTypes = {
    firstDataString: PropTypes.string,
    secondDataString: PropTypes.string,
    thirdDataString: PropTypes.string,
    viewData: PropTypes.object,
  };

  static defaultProps = {
    firstDataString: 'not set',
    secondDataString: 'not set',
    thirdDataString: 'not set',
    viewData: {},
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
        <h2>View Panel</h2>
        <h3>First string: {this.props.firstDataString}</h3>
        <h3>Second string: {this.props.secondDataString}</h3>
        <h3>Third string: {this.props.thirdDataString}</h3>
        <h2>View data:</h2>
        <pre>
          {JSON.stringify(this.props.viewData, null, 4)}
        </pre>
        <button onClick={this.handleChangeState}>Change State</button>
        <h3>State: {stateProbeValue}</h3>
      </div>
    );
  }
}

export default ViewPanel;
