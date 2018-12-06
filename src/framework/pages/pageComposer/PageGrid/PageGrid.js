import React from 'react';
import PropTypes from 'prop-types';
import {Grid} from 'styled-css-grid';

class PageGrid extends React.Component {
  static propTypes = {
    fluid: PropTypes.bool,
    elementKey: PropTypes.string,
    rows: PropTypes.string,
    columns: PropTypes.string,
    minRowHeight: PropTypes.string,
    gap: PropTypes.string,
  };

  static defaultProps = {
    elementKey: null,
    fluid: true,
  };

  constructor (props) {
    super(props);
  }

  render () {
    const {elementKey, fluid, rows, columns, minRowHeight, gap} = this.props;
    return (
      <Grid key={elementKey} fluid={fluid} {...{rows, columns, minRowHeight, gap}} >
        {this.props.children}
      </Grid>
    );
  }
}

export default PageGrid;
