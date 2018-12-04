import React from 'react';
import PropTypes from 'prop-types';

class ControlPanel extends React.Component {
  static propTypes = {
    onFirstClick: PropTypes.func,
    onSecondClick: PropTypes.func,
    firstDataString: PropTypes.string,
    firstDataString1: PropTypes.string,
    secondDataString: PropTypes.string,
    onDirectPassIn: PropTypes.func,
    subControlPanel: PropTypes.element,
    errorObject: PropTypes.object,
  };

  static defaultProps = {
    onFirstClick: () => {
      console.info('ControlPanel.onFirstClick is not set');
    },
    onSecondClick: () => {
      console.info('ControlPanel.onSecondClick is not set');
    },
    firstDataString: 'not set',
    firstDataString1: 'not set',
    secondDataString: 'not set',
    onDirectPassIn: () => {
      console.info('ControlPanel.onDirectPassIn is not set');
    },
    subControlPanel: null,
    errorObject: null,
  };

  constructor (props) {
    super(props);
  }

  handleDirectPassIn = () => {
    this.props.onDirectPassIn('Dima Direct');
  };

  render () {
    return (
      <div>
        <p>Control Panel</p>
        <h3>First string: {this.props.firstDataString}</h3>
        <h3>First string1: {this.props.firstDataString1}</h3>
        <h3>Second string: {this.props.secondDataString}</h3>
        <h3>Error: {`${this.props.errorObject}`}</h3>
        <button style={{padding: '1em'}} onClick={this.props.onFirstClick}>First Click</button>
        <button style={{padding: '1em'}} onClick={this.props.onSecondClick}>Second Click</button>
        <button style={{padding: '1em'}} onClick={this.handleDirectPassIn}>Direct pass to View</button>
        <div>
          <p>Sub Control</p>
          {this.props.subControlPanel}
        </div>
      </div>
    );
  }
}

export default ControlPanel;
