import React from 'react';
import PropTypes from 'prop-types';

class AboutPanel extends React.Component {
  static propTypes = {
    authorData: PropTypes.object,
    onRunMethodsChain: PropTypes.func,
  };

  static defaultProps = {
    authorData: {
      author: 'Unknown',
      day: 'DD',
      month: 'MM',
      year: 'YYYY'
    },
    onRunMethodsChain: () => {
      console.info('AboutPanel.onRunMethodsChain is not set');
    },
  };

  constructor (props) {
    super(props);
  }

  render () {
    const {authorData: {author, day, month, year}} = this.props;
    return (
      <div>
        <h1>About Panel</h1>
        <p>Author: {author}</p>
        <p>Date: {day}/{month}/{year}</p>
        <div>
          <button onClick={this.props.onRunMethodsChain}>Run methods chain</button>
        </div>
      </div>
    );
  }
}

export default AboutPanel;
