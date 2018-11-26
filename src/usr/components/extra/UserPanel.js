import React from 'react';
import PropTypes from 'prop-types';

class UserPanel extends React.Component {
  static propTypes = {
    onGoHome: PropTypes.func,
  };

  static defaultProps = {
    onGoHome: () => {
      console.info('UserPanel.onGoHome is not set');
    },
  };

  constructor (props) {
    super(props);
  }

  handleGoHome = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onGoHome();
  };

  render () {
    return (
      <div>
        <h1>User Panel</h1>
        <a href="#" onClick={this.handleGoHome}>Go Home</a>
      </div>
    );
  }
}

export default UserPanel;
