import React from 'react';
import PropTypes from 'prop-types';

class AboutPanel extends React.Component {
  static propTypes = {
    authorData: PropTypes.object,
  };

  static defaultProps = {
    authorData: {
      author: 'Unknown',
      day: 'DD',
      month: 'MM',
      year: 'YYYY'
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
      </div>
    );
  }
}

export default AboutPanel;
