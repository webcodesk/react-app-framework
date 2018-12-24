import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Cell } from 'styled-css-grid';
import Placeholder from './Placeholder';

/*
  ### I can use here the markdown syntax
  * And everything will be OK
  *
 */

// test line comment
class CSSGrid_HolyGrail extends React.Component {
  render () {
    const {header, menu, content, ads, footer} = this.props;
    return (
      <Grid
        columns={"100px 1fr 100px"}
        rows={"minmax(45px,auto) 1fr minmax(45px,auto)"}>
        <Cell width={3}>
          {header}
        </Cell>

        <Cell>{menu}</Cell>
        <Cell>{content}</Cell>
        <Cell>{ads}</Cell>

        <Cell width={3}>
          {footer}
        </Cell>
      </Grid>
    );
  }
}

CSSGrid_HolyGrail.propTypes = {
  header: PropTypes.element,
  menu: PropTypes.element,
  content: PropTypes.element,
  ads: PropTypes.element,
  footer: PropTypes.element,
};

CSSGrid_HolyGrail.defaultProps = {
  header: <Placeholder text="header" />,
  menu: <Placeholder text="menu" />,
  content: <Placeholder text="content" />,
  ads: <Placeholder text="ads" />,
  footer: <Placeholder text="footer " />,
};

export default CSSGrid_HolyGrail;
