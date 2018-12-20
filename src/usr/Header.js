import React from 'react';
import PropTypes from 'prop-types';

class Header extends React.Component {
  static propTypes = {
    title: PropTypes.string,
  };

  static defaultProps = {
    title: 'default title',
  };

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <h3>
        {this.props.title}
      </h3>
    );
  }
}

export default Header;
