import React from 'react';

class NotFoundComponent extends React.Component {

  render () {
    const { componentName } = this.props;
    return (
      <div style={{color: 'white', backgroundColor: 'red', borderRadius: '4px', padding: '.5em'}}>
        <code>Component is not found: "{componentName}"</code>
      </div>
    );
  }
}

export default NotFoundComponent;
