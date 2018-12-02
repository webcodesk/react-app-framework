import React from 'react';
import ReactDOM from 'react-dom';
import App, { initApp } from './app';
import './index.css';
import packageJson from '../package.json';

initApp(packageJson.name, packageJson.version);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
