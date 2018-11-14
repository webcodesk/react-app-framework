import React from 'react';

class NotFoundComponent extends React.Component {

  render () {
    const { componentName } = this.props;
    return (
      <p>Component is not found {componentName}</p>
    );
  }
}

export default NotFoundComponent;
