import React from 'react';
import ControlPanel from './ControlPanel';

export default [
  {
    story: 'With custom on onFirstClick',
    renderStory: () => {
      const handleOnClick = () => {
        alert('First click changed');
      };
      return (
        <ControlPanel firstDataString="Set by default" onFirstClick={handleOnClick} />
      )
    }
  },
  {
    story: 'With custom on onFirstClick 2',
    renderStory: () => {
      const handleOnClick = () => {
        alert('First click changed');
      };
      return (
        <ControlPanel firstDataString="With custom on onFirstClick" onFirstClick={handleOnClick} />
      )
    }
  }
]