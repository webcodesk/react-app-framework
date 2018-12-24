import React from 'react';
import ValueList from './ValueList';

export default [
  {
    story: 'With fake list',
    renderStory: () => {
      const list = [
        {
          text: 'First Item',
        },
        {
          text: 'Second Item',
        },
        {
          text: 'Third Item',
        },
      ]
      return <ValueList list={list}/>
    },
  }
]