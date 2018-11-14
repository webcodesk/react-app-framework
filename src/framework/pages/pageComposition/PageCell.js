import React from 'react';
import { Cell } from 'styled-css-grid';

class PageCell extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    const { children } = this.props;
    return (
      <Cell {...this.props}>
        {children.length > 0 ? children : <p>CELL</p>}
      </Cell>
    );
  }
}

export default PageCell;
