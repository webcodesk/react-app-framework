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
      const { type, props, events } = target;
      if (events && events.length > 0 && type === 'userFunction') {
        events.forEach(event => {
          const newTarget = {
            type,
            props,
            event: getEventSequence(event),
          };
          eventSequence.targets.push(newTarget);
        });
      } else {
        eventSequence.targets.push({
          type,
          props,
        });
      }
    });
  }
  return eventSequence;
};

const getActionSequences = (handlers, actionSequences = {}) => {
  if (handlers && handlers.length > 0) {
    handlers.forEach(handler => {
      const { type, props, events } = handler;
      if (events && events.length > 0) {
        events.forEach(event => {
          // console.info('Check target: ', type, props, event);
          let key;
          let handlerObject;
          if (event && event.name && event.targets && event.targets.length > 0) {
            if (type === 'component') {
              key = `${props.pageName}_${props.componentName}_${props.componentInstance}`;
              handlerObject = actionSequences[key] || { ...props, events: [] };
              const eventSequence = getEventSequence(event);
              // find the same event handler name for the container
              const existingHandlerEventIndex = handlerObject.events.findIndex(evn => evn.name === eventSequence.name);
              if (existingHandlerEventIndex >= 0) {
                // here we should merge targets of the same container events handler
                const existingHandlerEventTargets = handlerObject.events[existingHandlerEventIndex];
                if (existingHandlerEventTargets) {
                  console.info('existingHandlerEventTargets: ', existingHandlerEventTargets);
                  handlerObject.events[existingHandlerEventIndex].targets =
                    [...existingHandlerEventTargets.targets, ...eventSequence.targets];
                }
              } else {
                handlerObject.events.push(eventSequence);
              }
              // console.info('Check component: ', key);
              // console.info('Handler object: ', handlerObject);
              actionSequences[key] = handlerObject;
            }
            // console.info('Go through the targets in event: ', event.targets);
            getActionSequences(event.targets, actionSequences);
          }
        });
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
