import uniqueId from 'lodash/uniqueId';
import forOwn from 'lodash/forOwn';
import get from 'lodash/get';
import merge from 'lodash/merge';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isEmpty from 'lodash/isEmpty';
import unionWith from 'lodash/unionWith';
import * as constants from './constants';

let userFunctions = {};

function getTargetPropertiesFromEvents(events, targetProperties) {
  if (events && events.length > 0) {
    events.forEach(event => {
      const { targets } = event;
      if (targets && targets.length > 0) {
        let key;
        let propertiesObject;
        targets.forEach(target => {
          const { type, props, events } = target;
          if (type === constants.COMPONENT_TYPE && props) {
            const { componentName, componentInstance, propertyName, forwardPath } = props;
            if (propertyName) {
              key = `${componentName}_${componentInstance}`;
              propertiesObject = targetProperties[key] || {};
              // tell the that this property should be bind to the http request query
              propertiesObject[propertyName] = merge({}, propertiesObject[propertyName], {
                forwardPath
              });
              targetProperties[key] = propertiesObject;
            }
          }
          getTargetPropertiesFromEvents(events, targetProperties);
        });
      }
    });
  }
}

function deriveTargetProperties(actionSequences, targetProperties = {}) {
  forOwn(actionSequences, (value, prop) => {
    getTargetPropertiesFromEvents(value.events, targetProperties);
  });
  return targetProperties;
}

function getEventSequence(event) {
  const eventSequence = {};
  const { name, targets } = event;
  if (targets && targets.length > 0) {
    eventSequence.name = name;
    eventSequence.targets = [];
    targets.forEach(target => {
      const { type, props, events } = target;
      if (props && !isEmpty(props)) {
        const newTarget = {
          type,
        };
        if (type === constants.USER_FUNCTION_TYPE) {
          newTarget.props = {
            ...props,
            functionKey: uniqueId('function')
          };
        } else if (type === constants.COMPONENT_TYPE) {
          newTarget.props = {
            ...props,
            componentKey: uniqueId('component')
          };
        }
        if (events && events.length > 0 && type === constants.USER_FUNCTION_TYPE) {
          const newTargetEvents = [];
          events.forEach(targetEvent => {
            newTargetEvents.push(getEventSequence(targetEvent));
          });
          newTarget.events = newTargetEvents;
        }
        eventSequence.targets.push(newTarget);
      }
    });
  }
  return eventSequence;
}

function eventTargetComparator(destTarget, sourceTarget) {
  const { type: sourceType, props: sourceProps } = sourceTarget;
  const { type: destType, props: destProps } = destTarget;
  if (sourceType === destType) {
    if (sourceProps && destProps) {
      if (sourceProps.functionName && destProps.functionName) {
        return sourceProps.functionName === destProps.functionName;
      } else if (sourceProps.componentName && destProps.componentName) {
        return sourceProps.componentName === destProps.componentName
          && sourceProps.componentInstance === destProps.componentInstance
          && sourceProps.propertyName === destProps.propertyName
          && sourceProps.forwardPath === destProps.forwardPath;
      }
    }
  }
  return false;
}

function targetEventComparator(destEvent, sourceEvent) {
  return destEvent === sourceEvent || destEvent.name === sourceEvent.name;
}

function mergeEventTargets(destTargets, sourceTargets) {
  if (destTargets !== sourceTargets) {
    let resultTargets = unionWith(destTargets, sourceTargets, eventTargetComparator);
    resultTargets.forEach(resultTarget => {
      const sameSourceTarget = sourceTargets.find(sourceTarget => eventTargetComparator(resultTarget, sourceTarget));
      if (sameSourceTarget) {
        const resultTargetEvents = unionWith(resultTarget.events, sameSourceTarget.events, targetEventComparator);
        if (resultTargetEvents && resultTargetEvents.length > 0) {
          resultTargetEvents.forEach(resultTargetEvent => {
            let sameSourceTargetEvent;
            if (sameSourceTarget.events && sameSourceTarget.events.length > 0) {
              sameSourceTargetEvent =
                sameSourceTarget.events.find(sourceTargetEvent => targetEventComparator(resultTargetEvent, sourceTargetEvent));
            } else if (resultTarget.events && resultTarget.events.length > 0) {
              sameSourceTargetEvent =
                resultTarget.events.find(sourceTargetEvent => targetEventComparator(resultTargetEvent, sourceTargetEvent));
            }
            if (sameSourceTargetEvent) {
              resultTargetEvent.targets = mergeEventTargets(resultTargetEvent.targets, sameSourceTargetEvent.targets);
            }
          });
        }
        resultTarget.events = resultTargetEvents;
      }
    });
    return resultTargets;
  }
  return destTargets;
}

function getActionSequences(handlers, actionSequences = {}) {
  if (handlers && handlers.length > 0) {
    handlers.forEach(handler => {
      const { type, props, events } = handler;
      if (events && events.length > 0) {
        events.forEach(event => {
          let key;
          let handlerObject;
          if (event && event.name && event.targets && event.targets.length > 0) {
            if (type === constants.COMPONENT_TYPE) {
              key = `${props.componentName}_${props.componentInstance}`;
              handlerObject = actionSequences[key]
                || { ...props, componentKey: uniqueId('component'), events: [] };
              const eventSequence = getEventSequence(event);
              // find the same event handler name for the container
              const existingHandlerEventIndex =
                handlerObject.events.findIndex(evn => evn.name === eventSequence.name);
              if (existingHandlerEventIndex >= 0) {
                // here we should merge targets of the same container events handler
                const existingHandlerEvent = handlerObject.events[existingHandlerEventIndex];
                if (existingHandlerEvent) {
                  handlerObject.events[existingHandlerEventIndex].targets =
                    mergeEventTargets(existingHandlerEvent.targets, eventSequence.targets);
                }
              } else {
                handlerObject.events.push(eventSequence);
              }
              actionSequences[key] = handlerObject;
            }
            getActionSequences(event.targets, actionSequences);
          }
        });
      }
    });
  }
}

function createActionSequencesRecursively (handlers, actionSequences = {}) {
  forOwn(handlers, value => {
    if (isArray(value)) {
      // only arrays should be exported as flow sequences otherwise the object is assumed as a nested sequences
      getActionSequences(value, actionSequences);
    } else if (isObject(value)) {
      // if the handlers is object - it means we have a nested handlers description
      createActionSequencesRecursively(value, actionSequences);
    }
  });
  return actionSequences;
}

export function createActionSequences (handlers, functions) {
  userFunctions = functions;
  const actionSequences = createActionSequencesRecursively(handlers);
  const targetProperties = deriveTargetProperties(actionSequences);
  return { actionSequences, targetProperties };
}

export function getUserFunctionByName (functionName) {
  return get(userFunctions, functionName);
}
