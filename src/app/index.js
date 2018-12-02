import { initStore } from '../framework';

let App = null;

if (process.env.NODE_ENV !== 'production') {
  App = require('./AppDev').default;
} else {
  App = require('./App').default;
}

export function initApp(name, version) {
  initStore(name, version);
}

export default App;
