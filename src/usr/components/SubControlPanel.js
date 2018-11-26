import React from 'react';
import PropTypes from 'prop-types';

class SubControlPanel extends React.Component {
  static propTypes = {
    onGoToAbout: PropTypes.func,
    onGoToUser: PropTypes.func,
  };

  static defaultProps = {
    onGoToAbout: () => {
      console.info('SubControlPanel.onGoToAbout is not set');
    },
    onGoToUser: () => {
      console.info('SubControlPanel.onGoToUser is not set');
    },
  };

  constructor (props) {
    super(props);
  }

  handleGoToAbout = () => {
    this.props.onGoToAbout({
      author: 'Alex Pustovalov',
      day: '10',
      month: '10',
      year: '1977',
    });
  };

  handleGoToUser = () => {
    this.props.onGoToUser();
  };

  render () {
    return (
      <div>
        <button onClick={this.handleGoToAbout}>Go to About page</button>
        &nbsp;
        <button onClick={this.handleGoToUser}>Go to User page</button>
      </div>
    );
  }
}

export default SubControlPanel;
