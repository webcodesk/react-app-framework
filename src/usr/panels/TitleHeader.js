import React from 'react';
import PropTypes from 'prop-types';

class TitleHeader extends React.Component {
  static propTypes = {
    data: PropTypes.object,
  };

  static defaultProps = {
    data: {},
  };

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <h1 style={{textAlign: 'center'}}>
        Header Title
      </h1>
    );
  }
}

export default TitleHeader;
