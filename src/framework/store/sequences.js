import forOwn from 'lodash/forOwn';
import get from 'lodash/get';

let userFunctions = {};

const getEventSequence = (event) => {
  const eventSequence = {};
  const { name, targets } = event;
  if (targets && targets.length > 0) {
    eventSequence.name = name;
    eventSequence.targets = [];
    targets.forEach(target => {
      const { type, props, event } = target;
      const newTarget = {
        type,
        props
      };
      if (type === 'userFunction' && event) {
        newTarget.event = getEventSequence(event);
      }
      eventSequence.targets.push(newTarget);
    });
  }
  return eventSequence;
};

const getActionSequences = (handlers, actionSequences = {}) => {
  if (handlers && handlers.length > 0) {
    handlers.forEach(handler => {
      const { type, props, event } = handler;
      // console.info('Check target: ', type, props, event);
      let key;
      let handlerObject;
      if (event && event.name && event.targets && event.targets.length > 0) {
        if (type === 'component') {
          key = `${props.pageName}_${props.componentName}_${props.componentInstance}`;
          handlerObject = actionSequences[key] || { ...props, events: [] };
          handlerObject.events.push(getEventSequence(event));
          // console.info('Check component: ', key);
          // console.info('Handler object: ', handlerObject);
          actionSequences[key] = handlerObject;
        }
        // console.info('Go through the targets in event: ', event.targets);
        getActionSequences(event.targets, actionSequences);
      }
    });
  }
};

export function getUserFunctionByName (functionName) {
  return get(userFunctions, functionName);
}

export function createActionSequences (handlers, functions) {
  userFunctions = functions;
  let actionSequences = {};
  forOwn(handlers, value => {
    getActionSequences(value, actionSequences);
  });
  console.info('Action sequences: ', actionSequences);
  return actionSequences;
}
