import React from 'react';
import { hot } from 'react-hot-loader';
import Application, { initStore } from '../framework';
import schema from './schema';
import userComponents from './indices/userComponents';
import userFunctions from './indices/userFunctions';

let userComponentStories = {};
if (process.env.NODE_ENV !== 'production') {
  userComponentStories = require('./indices/userComponentStories').default;
}

export function initApp(name, version) {
  initStore(name, version);
}

const App = () =>
  (<Application
    schema={schema}
    userComponents={userComponents}
    userFunctions={userFunctions}
    userComponentStories={userComponentStories}
  />);

export default hot(module)(App);