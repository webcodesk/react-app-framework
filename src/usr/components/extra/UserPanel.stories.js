import React from 'react';
import UserPanel from './UserPanel';

export default [
  {
    story: 'another component',
    renderStory: () => {
      return (<h1>HEY!!!! Hello from the story and this is not component</h1>)
    }
  },
  {
    story: 'Alex From the Story',
    renderStory: () => {
      return (<UserPanel userName="Alex Component 1" onGoHome={() => {console.info("I'm in the story");}} />)
    }
  },
  {
    story: 'Alex From the Story',
    renderStory: () => {
      return (<UserPanel userName="Alex Component 2" onGoHome={() => {console.info("I'm in the story");}} />)
    }
  },
]
