import React from 'react';
import PropTypes from 'prop-types';

class ValueList extends React.Component {
  static propTypes = {
    list: PropTypes.array,
  };

  static defaultProps = {
    list: [],
  };

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <ul>
        {this.props.list.map(item => {
          return (
            <li>{item.text}</li>
          )
        })}
      </ul>
    );
  }
}

export default ValueList;
