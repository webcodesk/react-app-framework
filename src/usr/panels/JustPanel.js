import React from 'react';
import PropTypes from 'prop-types';

class JustPanel extends React.Component {
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
      <div style={{width: '100px', height: '100px', backgroundColor: 'green'}}>

      </div>
    );
  }
}

export default JustPanel;
