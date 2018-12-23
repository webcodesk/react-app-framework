import { initStore } from '../framework';
import App from './App';

export function initApp(name, version) {
  initStore(name, version);
}

export default App;
