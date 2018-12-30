import React from 'react';
import PropTypes from 'prop-types';

class InitialPanel extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
  };

  static defaultProps = {
    onClick: () => {},
  };

  constructor (props) {
    super(props);
  }

  handleClick = () => {
    this.props.onClick();
  };

  render () {
    return (
      <div style={{padding: '1em'}}>
        <button style={{padding: '1em'}} onClick={this.handleClick}>Click</button>
      </div>
    );
  }
}

export default InitialPanel;
