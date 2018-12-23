import React from 'react';
import { Grid } from 'styled-css-grid';

class PageGrid extends React.Component {

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
