import React from 'react';
import ValueList from './ValueList';

export default [
  {
    story: 'With fake list dfkjhdjks lhlue idhfskjfhw;u efy;ehufweubffd ffef sdf  wed   wewekhdljk',
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