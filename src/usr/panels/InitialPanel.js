import React from 'react';
import PropTypes from 'prop-types';

class InitialPanel extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
    onForward: PropTypes.func,
  };

  static defaultProps = {
    onClick: () => {},
    onForward: () => {},
  };

  constructor (props) {
    super(props);
  }

  handleClick = () => {
    this.props.onClick();
  };

  handleForward = () => {
    this.props.onForward();
  };

  render () {
    return (
      <div style={{padding: '1em'}}>
        <button style={{padding: '1em'}} onClick={this.handleClick}>Click</button>
        <button style={{padding: '1em'}} onClick={this.handleForward}>Forward</button>
      </div>
    );
  }
}

export default InitialPanel;
