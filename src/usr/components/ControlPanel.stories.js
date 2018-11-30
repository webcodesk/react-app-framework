import React from 'react';
import ControlPanel from './ControlPanel';

export default [
  {
    story: 'With custom on onFirstClick',
    renderStory: () => {
      const handleOnClick = () => {
        alert('OnFirstClick');
      };
      return (
        <ControlPanel onFirstClick={handleOnClick} />
      )
    }
  }
]