import React from 'react';
import PropTypes from 'prop-types';
import {Grid} from 'styled-css-grid';

class PageGrid extends React.Component {
  static propTypes = {
    fluid: PropTypes.bool,
    elementKey: PropTypes.string,
    sendMessageCallback: PropTypes.func,
  };

  static defaultProps = {
    elementKey: null,
    sendMessageCallback: null,
    fluid: true,
  };

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <Grid
        {...this.props}
      >
        {this.props.children}
      </Grid>
    );
  }
}

export default PageGrid;
