import React from 'react';

const style = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};

const preStyle = {
  margin: '1em'
};

const shadowStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  borderRadius: '4px',
  border: '1px dashed #dddddd',
  zIndex: 5,
};

class Placeholder extends React.Component {
  render () {
    return (
      <div style={style}>
        <div>
        <pre style={preStyle}>
          <code>
            &empty;
          </code>
        </pre>
        </div>
        <div style={shadowStyle} />
      </div>
    );
  }
}

export default Placeholder;
