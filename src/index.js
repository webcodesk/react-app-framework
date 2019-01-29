import React from 'react';
import ReactDOM from 'react-dom';
import App, { initApp } from './app';
import './index.css';

initApp();

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
