import React from 'react';
import ReactDOM from 'react-dom';
import Application, { initStore } from '../framework';

import schema from './schema';
import indices from './indices';
import packageJson from '../../package.json';

initStore(packageJson.name, packageJson.version);

let renderSchema;
let renderIndices;

const reRender = () => {
  ReactDOM.render(
    <Application
      routes={renderSchema.routes}
      pages={renderSchema.pages}
      flows={renderSchema.flows}
      userComponents={renderIndices.userComponents}
      userFunctions={renderIndices.userFunctions}
    />,
    document.getElementById('root')
  );
};

export const render = () => {
  renderSchema = schema;
  renderIndices = indices;
  reRender();
};

// Webpack Hot Module Replacement API
if (module.hot) {
  console.info('Module hot');
  module.hot.accept('./schema', () => {
    console.info('Module hot rerendering for schema');
    renderSchema = require('./schema').default;
    reRender();
  });
  module.hot.accept('./indices', () => {
    renderIndices = require('./indices').default;
    console.info('Module hot rerendering for indices');
    reRender();
  });
}
