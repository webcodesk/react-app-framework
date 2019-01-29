import * as constants from './constants';

export default function sendDebugMessage(payload) {
  if (window.__webcodeskIsListeningToFramework && window.__sendFrameworkMessage) {
    setTimeout(() => {
      window.__sendFrameworkMessage({
        type: constants.FRAMEWORK_MESSAGE_DEBUG,
        payload,
      });
    }, 0);
  }
}
