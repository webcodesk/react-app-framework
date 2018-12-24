import React from 'react';
import WithSingleButton from './WithSingleButton';

export default [
  {
    story: 'With some reaction',
    renderStory: () => {
      const onClickFunc = () => {
        alert('Clicked');
      };
      return <WithSingleButton onClick={onClickFunc} />
    },
  }
]