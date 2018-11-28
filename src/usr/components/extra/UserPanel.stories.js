import React from 'react';
import UserPanel from './UserPanel';

export default [
  {
    story: 'another component',
    renderStory: () => {
      return (<h1>HEY!!!! Hello from the story</h1>)
    }
  },
  {
    story: 'with some data sdhgjfjk ',
    renderStory: () => {
      return (<UserPanel userName="Alex From the Story" onGoHome={() => {console.info("I'm in the story");}} />)
    }
  },
]
