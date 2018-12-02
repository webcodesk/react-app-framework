import React from 'react';
import { hot } from 'react-hot-loader';
import Application from '../framework';
import schema from './schema';
import userComponents from './indices/userComponents';
import userComponentStories from './indices/userComponentStories';
import userFunctions from './indices/userFunctions';

const AppDev = () =>
  (<Application
    schema={schema}
    userComponents={userComponents}
    userFunctions={userFunctions}
    userComponentStories={userComponentStories}
  />);

// Webpack Hot Module Replacement API
if (module.hot) {
  console.info('Module hot');
  module.hot.accept('./schema', () => {
    console.info('Module hot rerendering for schema');
  });
  module.hot.accept('./indices/userFunctions', () => {
    console.info('Module hot rerendering for userFunctionsObject');
  });
  module.hot.accept('./indices/userComponents', () => {
    console.info('Module hot rerendering for userComponents');
  });
  module.hot.accept('./indices/userComponentStories', () => {
    console.info('Module hot rerendering for userComponentStories');
  });
}

export default hot(module)(AppDev);
