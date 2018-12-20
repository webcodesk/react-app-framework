import React from 'react';
import Form from './Form';

export default [
  {
    story: 'my story',
    renderStory: () => {
      const alertOnClick = (value) => {
        alert(value);
      };
      return <Form onSubmit={alertOnClick} />;
    },
  }
]