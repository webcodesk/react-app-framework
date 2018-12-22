import queryString from 'query-string';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import * as constants from './constants';
import { getUserFunctionByName } from './sequences';

let electron;
if (process.env.NODE_ENV !== 'production') {
  if (window.require) {
    electron = window.require('electron');
  }
}

function dispatchToComponent (props, payload, dispatch, helpers) {
  if (props) {
    const {
      componentName, componentInstance, propertyName, forwardPath
    } = props;
    if (forwardPath && helpers) {
      const { history } = helpers;
      if (forwardPath && history) {
        let pathString = `/${forwardPath}`;
        if (payload) {
          if (isNumber(payload) || isString(payload)) {
            // if user function dispatches string or number we pass it as the :parameter in the http request
            pathString = `${pathString}/${payload}`;
          } else if (isObject(payload) || isArray(payload)) {
            // if user function dispatches an object or an array we pass it as the request query
            pathString = `${pathString}?${queryString.stringify(payload)}`;
            console.error(`The mapping to parameters in URL is possible only for primitives.`);
          }
        }
        history.push(pathString);
      } else if (propertyName) {
        const targetKey = `${componentName}_${componentInstance}`;
        dispatch({ type: targetKey, payload: { [propertyName]: payload } });
      }
    } else {
      const targetKey = `${componentName}_${componentInstance}`;
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

function executeUserFunctionDispatch (events, innerTasks, dispatchType, payload, dispatch, getState, helpers) {
  let targetsCount = 0;
  // check if the user function dispatches any event
  const eventTargets = findEventTargets(events, dispatchType);
  if (eventTargets && eventTargets.length > 0) {
    targetsCount = eventTargets.length;
    eventTargets.forEach(eventTarget => {
      const { type: eventTargetType, props: eventTargetProps } = eventTarget;
      if (eventTargetType === constants.COMPONENT_TYPE) {
        dispatchToComponent(eventTargetProps, payload, dispatch, helpers);
      }
    });
    if (innerTasks[dispatchType] && innerTasks[dispatchType].length > 0) {
      innerTasks[dispatchType].forEach(task => {
        task.apply(null, [payload])(dispatch, getState, helpers);
      });
    }
  }
  return targetsCount;
}

function createTasks (targets, eventHandlerKey, actionsSequenceKey) {
  const tasks = [];
  if (targets && targets.length > 0) {
    targets.forEach(target => {
      const { type, props, events } = target;
      if (type === constants.USER_FUNCTION_TYPE && props) {
        // actions sequences key should be the starter target name
        // here is the function name
        actionsSequenceKey = actionsSequenceKey || props.functionName;
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
                    ...createTasks(userFunctionTargets, eventHandlerKey, actionsSequenceKey)
                  ];
                }
              }
            });
          }
          // create dispatchFunction in order to reuse its instance in the action function body
          const dispatchFunction = (dispatchType, payload, dispatch, getState, helpers) => {
            console.info('[Framework] Function execution: ', {
              eventHandlerKey,
              actionsSequenceKey,
              functionName: props.functionName,
              eventName: dispatchType,
              payload,
              timestamp: Date.now()
            });
            executeUserFunctionDispatch(events, innerTasks, dispatchType, payload, dispatch, getState, helpers);
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
              console.info('[Framework] Caught error: ', {
                eventHandlerKey,
                actionsSequenceKey,
                functionName: props.functionName,
                eventName: constants.DISPATCH_ERROR_TYPE,
                payload: error,
                timestamp: Date.now()
              });
              console.error(`In "${props.functionName}" function ${error}. To remove this line try to assign the "${constants.DISPATCH_ERROR_TYPE}" dispatch event of this function.`);
            }
          };
          // push function reference for user function dispatch
          tasks.push(function () {
            const args = arguments;
            // console.info('Invoked by redux: ', func);
            return (dispatch, getState, helpers) => {
              // execute user function with passed in args
              console.info('[Framework] Apply function: ', {
                eventHandlerKey,
                actionsSequenceKey,
                functionName: props.functionName,
                payload: args[0],
                timestamp: Date.now()
              });
              const userFunctionInstance = func.apply(null, args);
              try {
                // dispatch caughtException as null to the assigned targets
                caughtExceptionFunction(null, dispatch, getState, helpers);
                // now execute dispatching of the events objects to the targets
                const userFunctionResult = userFunctionInstance((dispatchType, payload) => {
                  // user function is invoked now
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
          });
        } else {
          console.error('[Framework] Missing function: ', {
            eventHandlerKey,
            actionsSequenceKey,
            functionName: props.functionName,
            timestamp: Date.now()
          });
        }
      } else if (type === constants.COMPONENT_TYPE && props) {
        tasks.push(function () {
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
        });
      }
    });
  }
  return tasks;
}

function createActions (eventHandlersKey, eventHandlers) {
  const actions = {};
  if (eventHandlers && eventHandlers.length > 0) {
    eventHandlers.forEach(eventHandler => {
      const { name, targets } = eventHandler;
      const tasks = createTasks(targets, `${eventHandlersKey}_${name}`);
      actions[name] = function () {
        const args = arguments;
        return (dispatch, getState, helpers) => {
          if (tasks.length > 0) {
            tasks.forEach(task => {
              task.apply(null, args)(dispatch, getState, helpers);
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
    actions = createActions(eventHandlersKey, eventHandlers);
    actionsCache.set(eventHandlersKey, actions);
  }
  return actions;
};
