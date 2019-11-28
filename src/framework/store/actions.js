import queryString from 'query-string';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isFunction from 'lodash/isFunction';
import isUndefined from 'lodash/isUndefined';
import { COMPONENT_TYPE, USER_FUNCTION_TYPE, DISPATCH_ERROR_TYPE} from './constants';
import { getUserFunctionByName } from './sequences';

let sendDebugMessage;
let constants;
if (process.env.NODE_ENV !== 'production') {
  sendDebugMessage = require('../commons/sendMessage').default;
  constants = require('../commons/constants');
}

function transformFirstArgument (elementKey, transformScript, firstArgument) {
  let firstArgumentResult = null;
  if (transformScript) {
    // get the transformation function from the cache
    let transformFunction = transformFunctionsCache.get(elementKey);
    if (!transformFunction) {
      try {
        // if there is a transformation in props save it into the cache as new Function
        const newTransformFunction = new Function('data', transformScript)();
        transformFunctionsCache.set(elementKey, newTransformFunction);
        transformFunction = newTransformFunction;
        if (!isFunction(newTransformFunction)) {
          console.error(`[Framework] The transformation script should return a JavaScript function: ${transformScript}`);
        }
      } catch (error) {
        console.error(`[Framework] In input transformation function "${transformScript.substr(0, 200)}${transformScript.length > 200 ? '...' : ''}" has error: "${error.message}".`);
      }
    }
    try {
      firstArgumentResult = transformFunction(firstArgument);
    } catch (error) {
      console.error(`[Framework] Transformation function error: ${error.message}`);
      firstArgumentResult = firstArgument;
    }
  } else {
    firstArgumentResult = firstArgument;
  }
  return firstArgumentResult;
}

function dispatchToComponent (taskEventName, props, payload, dispatch, helpers) {
  if (props) {
    const {
      componentName, componentInstance, propertyName, forwardPath, componentKey, transformScript
    } = props;
    const transformedPayload = transformFirstArgument(componentKey, transformScript, payload);
    if (forwardPath && helpers) {
      const { history } = helpers;
      if (history) {
        // hmmm... why there can not be the history helper?
        let pathString = `/${forwardPath}`;
        if (!isUndefined(transformedPayload)) {
          if (isNumber(transformedPayload) || isString(transformedPayload)) {
            // if user function dispatches string or number we pass it as the :parameter in the http request
            pathString = `${pathString}/${transformedPayload}`;
          } else if (isObject(transformedPayload) || isArray(transformedPayload)) {
            // if user function dispatches an object or an array we pass it as the request query
            pathString = `${pathString}?${queryString.stringify(transformedPayload)}`;
          } else {
            console.error(
              '[Framework] The mapping to parameters in URL is possible only for ' +
              'a string, a number, an object, or an array.'
            );
          }
        }
        if (process.env.NODE_ENV !== 'production') {
          sendDebugMessage({
            key: componentKey,
            eventType: constants.DEBUG_MSG_FORWARD_EVENT,
            forwardPath,
            inputData: transformedPayload,
            propertyName,
            pathString,
            timestamp: Date.now(),
          });
        }
        history.push(pathString);
      } else if (propertyName) {
        // hmmm... why there can not be the history helper?
        const targetKey = `${componentName}_${componentInstance}`;
        if (process.env.NODE_ENV !== 'production') {
          sendDebugMessage({
            key: componentKey,
            eventType: constants.DEBUG_MSG_REDUCE_DATA_EVENT,
            inputData: transformedPayload,
            componentName,
            componentInstance,
            propertyName,
            timestamp: Date.now(),
          });
        }
        dispatch({ type: targetKey, payload: { [propertyName]: transformedPayload } });
      }
    } else {
      const targetKey = `${componentName}_${componentInstance}`;
      if (process.env.NODE_ENV !== 'production') {
        sendDebugMessage({
          key: componentKey,
          eventType: constants.DEBUG_MSG_REDUCE_DATA_EVENT,
          inputData: transformedPayload,
          componentName,
          componentInstance,
          propertyName,
          timestamp: Date.now(),
        });
      }
      dispatch({ type: targetKey, payload: { [propertyName]: transformedPayload } });
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
      if (eventTargetType === COMPONENT_TYPE) {
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
      if (type === USER_FUNCTION_TYPE && props) {
        const func = getUserFunctionByName(props.functionName);
        if (func) {
          // we need to check if there is a user function sequence
          let innerTasks = {};
          if (events && events.length > 0) {
            events.forEach(innerEvent => {
              if (innerEvent && innerEvent.targets) {
                // select only user function targets
                const userFunctionTargets =
                  innerEvent.targets.filter(innerEventTarget => innerEventTarget.type === USER_FUNCTION_TYPE);
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
            if (process.env.NODE_ENV !== 'production' && error) {
              sendDebugMessage({
                key: props.functionKey,
                eventType: constants.DEBUG_MSG_FUNCTION_FIRE_EVENT,
                eventName: DISPATCH_ERROR_TYPE,
                outputData: error && error.message,
                functionName: props.functionName,
                timestamp: Date.now(),
              });
            }
            executeUserFunctionDispatch(
              events, innerTasks, DISPATCH_ERROR_TYPE, error, dispatch, getState, helpers
            );
            if (error) {
              console.error(`[Framework] In "${props.functionName}" function ${error.message}.`);
            }
          };
          // push function reference for user function dispatch
          tasks.push({
            functionKey: props.functionKey,
            funcName: props.functionName,
            func: function () {
              const args = arguments;
              return (dispatch, getState, helpers) => {
                // before execute the function we have to transform the input argument if needed
                const firstArgument =
                  transformFirstArgument(props.functionKey, props.transformScript, args[0]);
                // execute user function with passed in args
                if (process.env.NODE_ENV !== 'production') {
                  sendDebugMessage({
                    key: props.functionKey,
                    eventType: constants.DEBUG_MSG_FUNCTION_CALL_EVENT,
                    inputData: firstArgument,
                    functionName: props.functionName,
                    timestamp: Date.now(),
                  });
                }
                // the secondary argument is used in the store items function
                // to determine if we are reading from the store item or writing to it
                const userFunctionInstance = func.apply(null, [firstArgument]);
                try {
                  // dispatch caughtException as null to the assigned targets
                  caughtExceptionFunction(null, dispatch, getState, helpers);
                  // now execute dispatching of the events objects to the targets
                  const userFunctionResult = userFunctionInstance((dispatchType, payload) => {
                    // user function is invoked now
                    if (process.env.NODE_ENV !== 'production') {
                      sendDebugMessage({
                        key: props.functionKey,
                        eventType: constants.DEBUG_MSG_FUNCTION_FIRE_EVENT,
                        eventName: dispatchType,
                        outputData: payload,
                        functionName: props.functionName,
                        timestamp: Date.now(),
                      });
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
      } else if (type === COMPONENT_TYPE && props) {
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
const transformFunctionsCache = new Map();

export function clearActionsCache () {
  actionsCache.clear();
  transformFunctionsCache.clear();
}

export default function (eventHandlersKey, eventHandlers) {
  let actions = actionsCache.get(eventHandlersKey);
  if (!actions) {
    actions = createActions(eventHandlers);
    actionsCache.set(eventHandlersKey, actions);
  }
  return actions;
};
