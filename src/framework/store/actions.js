import queryString from 'query-string';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isUndefined from 'lodash/isUndefined';
import * as constants from './constants';
import { getUserFunctionByName } from './sequences';

const env = process.env;
let sendDebugMessage;
if (env.NODE_ENV !== 'production') {
  sendDebugMessage = require('../commons/sendMessage').default;
}

function dispatchToComponent (taskEventName, props, payload, dispatch, helpers) {
  if (props) {
    const {
      componentName, componentInstance, propertyName, forwardPath, componentKey
    } = props;
    if (forwardPath && helpers) {
      const { history } = helpers;
      if (history) {
        // hmmm... why there can not be the history helper?
        let pathString = `/${forwardPath}`;
        if (!isUndefined(payload)) {
          if (isNumber(payload) || isString(payload)) {
            // if user function dispatches string or number we pass it as the :parameter in the http request
            pathString = `${pathString}/${payload}`;
          } else if (isObject(payload) || isArray(payload)) {
            // if user function dispatches an object or an array we pass it as the request query
            pathString = `${pathString}?${queryString.stringify(payload)}`;
            console.error(`The mapping to parameters in URL is possible only for primitives.`);
          }
        }
        if (env.NODE_ENV !== 'production') {
          sendDebugMessage({
            key: componentKey,
            eventType: 'forwardToPath',
            forwardPath,
            data: payload,
            propertyName,
            pathString,
            timestamp: Date.now(),
          });
          // console.info(`[${componentKey}] Forward to page`, pathString);
        }
        history.push(pathString);
      } else if (propertyName) {
        // hmmm... why there can not be the history helper?
        const targetKey = `${componentName}_${componentInstance}`;
        if (env.NODE_ENV !== 'production') {
          sendDebugMessage({
            key: componentKey,
            eventType: 'reduceData',
            data: payload,
            componentName,
            componentInstance,
            propertyName,
            timestamp: Date.now(),
          });
          // console.info(`[${componentKey}] Reduce data to "${componentName}:${componentInstance} -> ${propertyName}"`, payload);
        }
        dispatch({ type: targetKey, payload: { [propertyName]: payload } });
      }
    } else {
      const targetKey = `${componentName}_${componentInstance}`;
      if (env.NODE_ENV !== 'production') {
        sendDebugMessage({
          key: componentKey,
          eventType: 'reduceData',
          data: payload,
          componentName,
          componentInstance,
          propertyName,
          timestamp: Date.now(),
        });
        // console.info(`[${componentKey}] Reduce data to "${componentName}:${componentInstance} -> ${propertyName}"`, payload);
      }
      dispatch({ type: targetKey, payload: { [propertyName]: payload } });
    }
  }
}

function findEventTargets (events, type) {
  let result;
  if (events && events.length > 0) {
    const event = events.find(targetEvent => targetEvent.name === type);
    if (event && event.targets && event.targets.length > 0) {
      result = event.targets;
    }
  }
  return result;
}

function executeUserFunctionDispatch (
  events, innerTasks, dispatchType, payload, dispatch, getState, helpers
) {
  let targetsCount = 0;
  // check if the user function dispatches any event
  const eventTargets = findEventTargets(events, dispatchType);
  if (eventTargets && eventTargets.length > 0) {
    targetsCount = eventTargets.length;
    eventTargets.forEach(eventTarget => {
      const { type: eventTargetType, props: eventTargetProps } = eventTarget;
      if (eventTargetType === constants.COMPONENT_TYPE) {
        dispatchToComponent(dispatchType, eventTargetProps, payload, dispatch, helpers);
      }
    });
    if (innerTasks[dispatchType] && innerTasks[dispatchType].length > 0) {
      innerTasks[dispatchType].forEach(task => {
        const { func } = task;
        func.apply(null, [payload])(dispatch, getState, helpers);
      });
    }
  }
  return targetsCount;
}

function createTasks (targets, taskEventName) {
  const tasks = [];
  if (targets && targets.length > 0) {
    targets.forEach(target => {
      const { type, props, events } = target;
      if (type === constants.USER_FUNCTION_TYPE && props) {
        const func = getUserFunctionByName(props.functionName);
        if (func) {
          // First we need to check if there is a user function sequence
          let innerTasks = {};
          if (events && events.length > 0) {
            events.forEach(innerEvent => {
              if (innerEvent && innerEvent.targets) {
                // select only user function targets
                const userFunctionTargets =
                  innerEvent.targets.filter(innerEventTarget => innerEventTarget.type === constants.USER_FUNCTION_TYPE);
                if (userFunctionTargets && userFunctionTargets.length > 0) {
                  innerTasks[innerEvent.name] = innerTasks[innerEvent.name] || [];
                  innerTasks[innerEvent.name] = [
                    ...innerTasks[innerEvent.name],
                    ...createTasks(userFunctionTargets, innerEvent.name)
                  ];
                }
              }
            });
          }
          // create dispatchFunction in order to reuse its instance in the action function body
          const dispatchFunction = (dispatchType, payload, dispatch, getState, helpers) => {
            executeUserFunctionDispatch(
              events, innerTasks, dispatchType, payload, dispatch, getState, helpers
            );
          };
          // this function is used to pass the error object caught by the exception caching
          // the function is called with null error object before each user function invocation
          // this will let user to do not worry about the clearing of the error object
          const caughtExceptionFunction = (error, dispatch, getState, helpers) => {
            const eventTargetsCount =
              executeUserFunctionDispatch(
                events, innerTasks, constants.DISPATCH_ERROR_TYPE, error, dispatch, getState, helpers
              );
            if (eventTargetsCount === 0 && error) {
              if (env.NODE_ENV !== 'production') {
                sendDebugMessage({
                  key: props.functionKey,
                  eventType: 'functionDispatch',
                  eventName: constants.DISPATCH_ERROR_TYPE,
                  payload: error,
                  functionName: props.functionName,
                  timestamp: Date.now(),
                });
                // console.info(`[${props.functionKey}] Dispatch function "${props.functionName} -> ${constants.DISPATCH_ERROR_TYPE}`, error);
              }
              console.error(`In "${props.functionName}" function ${error}. To remove this line try to assign the "${constants.DISPATCH_ERROR_TYPE}" dispatch event of this function.`);
            }
          };
          // push function reference for user function dispatch
          tasks.push({
            functionKey: props.functionKey,
            funcName: props.functionName,
            func: function () {
              const args = arguments;
              return (dispatch, getState, helpers) => {
                // execute user function with passed in args
                if (env.NODE_ENV !== 'production') {
                  sendDebugMessage({
                    key: props.functionKey,
                    eventType: 'callFunction',
                    argument: args ? args[0] : undefined,
                    functionName: props.functionName,
                    timestamp: Date.now(),
                  });
                  // console.info(`[${props.functionKey}] Call function "${props.functionName}"`, args[0]);
                }
                const userFunctionInstance = func.apply(null, [args[0]]);
                try {
                  // dispatch caughtException as null to the assigned targets
                  caughtExceptionFunction(null, dispatch, getState, helpers);
                  // now execute dispatching of the events objects to the targets
                  const userFunctionResult = userFunctionInstance((dispatchType, payload) => {
                    // user function is invoked now
                    if (env.NODE_ENV !== 'production') {
                      sendDebugMessage({
                        key: props.functionKey,
                        eventType: 'fireFunctionEvent',
                        eventName: dispatchType,
                        payload,
                        functionName: props.functionName,
                        timestamp: Date.now(),
                      });
                      // console.info(`[${props.functionKey}] Dispatch function "${props.functionName} -> ${dispatchType}`, payload);
                    }
                    dispatchFunction(dispatchType, payload, dispatch, getState, helpers);
                  });
                  // here user returns a Promise and there may be the error
                  if (userFunctionResult && userFunctionResult.then) {
                    userFunctionResult.catch(error => {
                      caughtExceptionFunction(error, dispatch, getState, helpers);
                    });
                  }
                } catch (error) {
                  caughtExceptionFunction(error, dispatch, getState, helpers);
                }
              };
            }
          });
        } else {
          console.error(`[Framework] Missing function: ${props.functionName}`);
        }
      } else if (type === constants.COMPONENT_TYPE && props) {
        tasks.push({
          func: function () {
            const args = arguments;
            // arguments here is the passed parameters from the component event handler
            // we have to take only the first argument as a payload
            let payload = null;
            if (args.length > 0) {
              payload = args[0];
            }
            return (dispatch, getState, helpers) => {
              dispatchToComponent(taskEventName, props, payload, dispatch, helpers);
            };
          }
        });
      }
    });
  }
  return tasks;
}

function createActions (eventHandlers) {
  const actions = {};
  if (eventHandlers && eventHandlers.length > 0) {
    eventHandlers.forEach(eventHandler => {
      const { name, targets } = eventHandler;
      const tasks = createTasks(targets, name);
      actions[name] = function () {
        const args = arguments;
        return (dispatch, getState, helpers) => {
          if (tasks.length > 0) {
            tasks.forEach(task => {
              if (task.func) {
                task.func.apply(null, args)(dispatch, getState, helpers);
              }
            });
          }
        };
      };
    });
  }
  return actions;
}

const actionsCache = new Map();

export function clearActionsCache () {
  actionsCache.clear();
}

export default function (eventHandlersKey, eventHandlers) {
  let actions = actionsCache.get(eventHandlersKey);
  if (!actions) {
    actions = createActions(eventHandlers);
    actionsCache.set(eventHandlersKey, actions);
  }
  return actions;
};
