import React from 'react';

const style = {
  width: '100%',
  height: '100%',
  backgroundColor: '#dddddd',
  outline: '1px solid #cdcdcd',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default (props) => {
  return (
    <div style={style}>
      <div>
        <pre>
          <code>
            {props.text}
          </code>
        </pre>
      </div>
    </div>
  );
};