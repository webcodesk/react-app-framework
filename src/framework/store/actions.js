import queryString from 'query-string';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isFunction from 'lodash/isFunction';
import isUndefined from 'lodash/isUndefined';
import cloneDeep from 'lodash/cloneDeep';
import forOwn from 'lodash/forOwn';
import { COMPONENT_TYPE, USER_FUNCTION_TYPE, DISPATCH_ERROR_TYPE} from './constants';
import { getUserFunctionByName } from './sequences';

const TRANSFORMATION_ERROR_SKIP_DATA_TRANSFERRING = 'TRANSFORMATION_ERROR_SKIP_DATA_TRANSFERRING';

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
        const newTransformFunction = new Function('data', `return ${transformScript}`)();
        transformFunctionsCache.set(elementKey, newTransformFunction);
        transformFunction = newTransformFunction;
        if (!isFunction(newTransformFunction)) {
          console.error(`[Framework] The transformation script should be a JavaScript function. Check the transformation script: ${transformScript}`);
        }
      } catch (error) {
        console.error(`[Framework] The transformation function "${transformScript.substr(0, 200)}${transformScript.length > 200 ? '...' : ''}" has the error: "${error.message}".`);
      }
    }
    try {
      firstArgumentResult = transformFunction(firstArgument);
    } catch (error) {
      throw Error(`Transformation function error: ${error.message}`);
    }
    if (typeof firstArgumentResult === 'undefined') {
      throw Error(TRANSFORMATION_ERROR_SKIP_DATA_TRANSFERRING);
    }
  } else {
    firstArgumentResult = firstArgument;
  }
  return firstArgumentResult;
}

function dispatchToComponent (props, payload, dispatch, helpers) {
  if (props) {
    const {
      componentName, componentInstance, propertyName, forwardPath, componentKey, transformScript
    } = props;
    try {
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
            if (window.__webcodeskIsListeningToFramework && window.__sendFrameworkMessage) {
              sendDebugMessage({
                key: componentKey,
                eventType: constants.DEBUG_MSG_FORWARD_EVENT,
                forwardPath,
                inputData: cloneDeep(transformedPayload),
                propertyName,
                pathString,
                timestamp: Date.now(),
              });
            }
          }
          history.push(pathString);
        } else if (propertyName) {
          // hmmm... why there can not be the history helper?
          const targetKey = `${componentName}_${componentInstance}`;
          if (process.env.NODE_ENV !== 'production') {
            if (window.__webcodeskIsListeningToFramework && window.__sendFrameworkMessage) {
              sendDebugMessage({
                key: componentKey,
                eventType: constants.DEBUG_MSG_REDUCE_DATA_EVENT,
                inputData: cloneDeep(transformedPayload),
                componentName,
                componentInstance,
                propertyName,
                timestamp: Date.now(),
              });
            }
          }
          dispatch({ type: targetKey, payload: { [propertyName]: transformedPayload } });
        }
      } else {
        const targetKey = `${componentName}_${componentInstance}`;
        if (process.env.NODE_ENV !== 'production') {
          if (window.__webcodeskIsListeningToFramework && window.__sendFrameworkMessage) {
            sendDebugMessage({
              key: componentKey,
              eventType: constants.DEBUG_MSG_REDUCE_DATA_EVENT,
              inputData: cloneDeep(transformedPayload),
              componentName,
              componentInstance,
              propertyName,
              timestamp: Date.now(),
            });
          }
        }
        dispatch({ type: targetKey, payload: { [propertyName]: transformedPayload } });
      }
    } catch (e) {
      if (e && e.message !== TRANSFORMATION_ERROR_SKIP_DATA_TRANSFERRING) {
        console.error(`[Framework] ${e.message}`);
      }
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
  events, innerTasks, functionKey, functionName, dispatchPayloads, dispatch, getState, helpers
) {
  const dispatchTypeKeys = dispatchPayloads ? Object.keys(dispatchPayloads) : null;
  let dispatchType;
  let payload;
  if (dispatchTypeKeys && dispatchTypeKeys.length > 0) {
    for (let i = 0; i < dispatchTypeKeys.length; i++) {
      dispatchType = dispatchTypeKeys[i];
      // check if the user function dispatches any event
      const eventTargets = findEventTargets(events, dispatchType);
      if (eventTargets && eventTargets.length > 0) {
        payload = dispatchPayloads[dispatchType];
        if (process.env.NODE_ENV !== 'production') {
          if (window.__webcodeskIsListeningToFramework && window.__sendFrameworkMessage) {
            sendDebugMessage({
              key: functionKey,
              eventType: constants.DEBUG_MSG_FUNCTION_FIRE_EVENT,
              eventName: dispatchType,
              outputData: cloneDeep(payload),
              functionName: functionName,
              timestamp: Date.now(),
            });
          }
        }
        eventTargets.forEach(eventTarget => {
          const { type: eventTargetType, props: eventTargetProps } = eventTarget;
          if (eventTargetType === COMPONENT_TYPE) {
            dispatchToComponent(eventTargetProps, payload, dispatch, helpers);
          }
        });
        if (innerTasks[dispatchType] && innerTasks[dispatchType].length > 0) {
          innerTasks[dispatchType].forEach(task => {
            const { func } = task;
            func.apply(null, [payload])(dispatch, getState, helpers);
          });
        }
      }
    }
  }
}

function createTasks (targets) {
  const tasks = [];
  if (targets && targets.length > 0) {
    targets.forEach(target => {
      const { type, props, events } = target;
      if (type === USER_FUNCTION_TYPE && props) {
        const func = getUserFunctionByName(props.functionName);
        if (func) {
          // we need to check if there is a user function sequence
          let innerTasks = {};
          let componentTargetsStateMapping;
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
                    ...createTasks(userFunctionTargets)
                  ];
                }
                if (props.isUsingTargetState) {
                  const componentTargets =
                    innerEvent.targets.filter(innerEventTarget => innerEventTarget.type === COMPONENT_TYPE);
                  if (componentTargets.length > 0) {
                    const mapping = [];
                    let innerEventTarget;
                    for (let it = 0; it < innerEvent.targets.length; it++) {
                      innerEventTarget = innerEvent.targets[it];
                      if (innerEventTarget && innerEventTarget.props) {
                        const { componentName, componentInstance, propertyName } = innerEventTarget.props;
                        mapping.push({
                          targetInstanceKey: `${componentName}_${componentInstance}`,
                          targetPropertyKey: propertyName,
                        });
                      }
                    }
                    componentTargetsStateMapping = componentTargetsStateMapping || {};
                    componentTargetsStateMapping[innerEvent.name] = mapping;
                  }
                }
              }
            });
          }
          // create dispatchFunction in order to reuse its instance in the action function body
          const dispatchFunction = (functionKey, functionName, dispatchPayloads, dispatch, getState, helpers) => {
            executeUserFunctionDispatch(
              events, innerTasks, functionKey, functionName, dispatchPayloads, dispatch, getState, helpers
            );
          };
          // this function is used to pass the error object caught by the exception caching
          // the function is called with null error object before each user function invocation
          // this will let user to do not worry about the clearing of the error object
          const caughtExceptionFunction = (functionKey, functionName, error, dispatch, getState, helpers) => {
            executeUserFunctionDispatch(
              events,
              innerTasks,
              functionKey,
              functionName,
              {[DISPATCH_ERROR_TYPE]: error},
              dispatch,
              getState,
              helpers
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
                try {
                  const firstArgument =
                    transformFirstArgument(props.functionKey, props.transformScript, args[0]);
                  // execute user function with passed in args
                  if (process.env.NODE_ENV !== 'production') {
                    if (window.__webcodeskIsListeningToFramework && window.__sendFrameworkMessage) {
                      sendDebugMessage({
                        key: props.functionKey,
                        eventType: constants.DEBUG_MSG_FUNCTION_CALL_EVENT,
                        inputData: cloneDeep(firstArgument),
                        functionName: props.functionName,
                        timestamp: Date.now(),
                      });
                    }
                  }
                  let targetsStates;
                  if (componentTargetsStateMapping) {
                    targetsStates = {};
                    const currentGlobalState = getState();
                    let targetPropertyState;
                    forOwn(componentTargetsStateMapping, (value, key) => {
                      if (value && value.length > 0) {
                        targetsStates[key] = {};
                        for (let vi = 0; vi < value.length; vi++) {
                          targetPropertyState = currentGlobalState[value[vi].targetInstanceKey];
                          if (targetPropertyState) {
                            targetsStates[key][value[vi].targetPropertyKey] =
                              cloneDeep(targetPropertyState[value[vi].targetPropertyKey]);
                          }
                        }
                      }
                    });
                  }
                  const userFunctionInstance = func.apply(null, [firstArgument, targetsStates]);
                  try {
                    // dispatch caughtException as null to the assigned targets
                    caughtExceptionFunction(
                      props.functionKey,
                      props.functionName,
                      null,
                      dispatch,
                      getState,
                      helpers
                    );
                    // now execute dispatching of the events objects to the targets
                    const userFunctionResult = userFunctionInstance((dispatchPayloads) => {
                      // user function is invoked now
                      dispatchFunction(
                        props.functionKey,
                        props.functionName,
                        dispatchPayloads,
                        dispatch,
                        getState,
                        helpers
                      );
                    });
                    // here user returns a Promise and there may be the error
                    if (userFunctionResult && userFunctionResult.then) {
                      userFunctionResult.catch(error => {
                        caughtExceptionFunction(
                          props.functionKey,
                          props.functionName,
                          error,
                          dispatch,
                          getState,
                          helpers
                        );
                      });
                    }
                  } catch (error) {
                    caughtExceptionFunction(
                      props.functionKey,
                      props.functionName,
                      error,
                      dispatch,
                      getState,
                      helpers
                    );
                  }
                } catch (e) {
                  if (e && e.message !== TRANSFORMATION_ERROR_SKIP_DATA_TRANSFERRING) {
                    console.error(`[Framework] ${e.message}`);
                  }
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
              dispatchToComponent(props, payload, dispatch, helpers);
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
      const tasks = createTasks(targets);
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
