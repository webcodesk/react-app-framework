import React from 'react';
import PropTypes from 'prop-types';

class Panel extends React.Component {
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
      <div>
        <pre>
          {JSON.stringify(this.props.data, null, 4)}
        </pre>
      </div>
    );
  }
}

export default Panel;
