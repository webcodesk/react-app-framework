import React from 'react';
import ReactDOM from 'react-dom';
import Application, { initStore } from '../framework';

import schema from './schema';
import userComponents from './indices/userComponents';
import userFunctions from './indices/userFunctions';
import packageJson from '../../package.json';

let userComponentStories = {};
if (process.env.NODE_ENV === 'development') {
  userComponentStories = require('./indices/userComponentStories').default;
}

initStore(packageJson.name, packageJson.version);

export const render = () => {
  ReactDOM.render(
    <Application
      schema={schema}
      userComponents={userComponents}
      userFunctions={userFunctions}
      userComponentStories={userComponentStories}
    />,
    document.getElementById('root')
  );
};
