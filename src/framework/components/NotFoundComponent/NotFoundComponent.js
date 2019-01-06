import React from 'react';

export function getComponentName(canonicalComponentName) {
  const titleParts = canonicalComponentName ? canonicalComponentName.split('.') : [];
  if (titleParts.length > 0) {
    return titleParts[titleParts.length - 1];
  }
  return canonicalComponentName;
}

class NotFoundComponent extends React.Component {

  render () {
    const { componentName } = this.props;
    return (
      <div style={{color: 'white', backgroundColor: 'red', borderRadius: '4px', padding: '.5em'}}>
        <code>Component is not found: "{getComponentName(componentName)}"</code>
      </div>
    );
  }
}

export default NotFoundComponent;
