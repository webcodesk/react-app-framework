import queryString from 'query-string';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
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
      componentName, componentInstance, propertyName, forwardPath, forwardRule
    } = props;
    // console.info('Dispatch/Forward to component: ', pageName, componentName, componentInstance, isForward, helpers);
    // todo: componentName and componentInstance attributes may not be present, hide target key initialization
    const targetKey = `${componentName}_${componentInstance}`;
    if (forwardPath && helpers) {
      // console.info('Forwarding routine start with helpers: ', helpers);
      const { history } = helpers;
      if (forwardPath && history) {
        let pathString = forwardPath;
        const { withParams, withQuery } = forwardRule || {};
        if (withParams) {
          if (!payload) {
            console.error(`Cannot add parameters to "${pathString}" URL due to undefined payload. Remove forward with parameters setting or pass not null value in the dispatch`);
          } else {
            if (isNumber(payload) || isString(payload)) {
              pathString = `${pathString}/${payload}`;
            } else if (isObject(payload) || isArray(payload)) {
              console.error(`The mapping to parameters in URL is possible only for primitives.`);
            }
          }
        } else if (withQuery) {
          if (!payload) {
            console.error(`Cannot add parameters to "${pathString}" URL due to undefined payload. Remove forward with parameters setting or pass not null value in the dispatch`);
          } else {
            if (isNumber(payload) || isString(payload) && propertyName) {
              pathString = `${pathString}?${propertyName}=${payload}`;
            } else if (isObject(payload) || isArray(payload)) {
              pathString = `${pathString}?${queryString.stringify(payload)}`;
            }
          }
        } else if (propertyName) {
          dispatch({ type: targetKey, payload: { [propertyName]: payload } });
        }
        console.info('Actions forward to: ', pathString);
        history.push(pathString);
      }
    } else {
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

function createTasks (targets) {
  const tasks = [];
  if (targets && targets.length > 0) {
    targets.forEach(target => {
      const { type, props, events } = target;
      if (type === 'userFunction' && props) {
        const func = getUserFunctionByName(props.functionName);
        // console.info('Create tasks (props.functionName): ', props.functionName, func);
        if (func) {
          // First we need to check if there is the user function sequence
          let innerTasks = {};
          if (events && events.length > 0) {
            events.forEach(innerEvent => {
              if (innerEvent && innerEvent.targets) {
                // select only user function targets
                const userFunctionTargets =
                  innerEvent.targets.filter(innerEventTarget => innerEventTarget.type === 'userFunction');
                if (userFunctionTargets && userFunctionTargets.length > 0) {
                  console.info('Create tasks (event.targets): ', props.functionName, userFunctionTargets);
                  innerTasks[innerEvent.name] = innerTasks[innerEvent.name] || [];
                  innerTasks[innerEvent.name] = innerTasks[innerEvent.name].concat(createTasks(userFunctionTargets));
                }
              }
            });
          }
          // push function reference for user function dispatch
          tasks.push(function () {
            const args = arguments;
            // console.info('Invoked by redux: ', func);
            return (dispatch, getState, helpers) => {
              // console.info('Apply user function: ', func);
              // pass in the dispatch function instance to the flow function
              const userFunctionInstance = func.apply(null, args);
              // this function is used to pass the error object caugh by the embedded exception caching
              // the function is called with null error object before each user function invocation
              // this will let user to do not worry about the clearing of the error object
              const caughtExceptionFunction = function(error) {
                const dispatchErrorType = 'caughtException';
                const eventTargets = findEventTargets(events, dispatchErrorType);
                if (eventTargets && eventTargets.length > 0) {
                  eventTargets.forEach(eventTarget => {
                    const { type: eventTargetType, props: eventTargetProps } = eventTarget;
                    if (eventTargetType === 'component') {
                      dispatchToComponent(eventTargetProps, error, dispatch, helpers);
                    }
                  });
                  if (innerTasks[dispatchErrorType] && innerTasks[dispatchErrorType].length > 0) {
                    innerTasks[dispatchErrorType].forEach(task => {
                      task.apply(null, [error])(dispatch, getState, helpers);
                    });
                  }
                } else {
                  if (error) {
                    console.error(`In "${props.functionName}" function ${error}. Probably ${dispatchErrorType} dispatch event is not assigned to any target.`);
                  }
                }
              };
              try {
                caughtExceptionFunction(null);
                const userFunctionResult = userFunctionInstance((dispatchType, payload) => {
                  // user function is invoked now
                  // check if the user function dispatches any event
                  const eventTargets = findEventTargets(events, dispatchType);
                  if (eventTargets && eventTargets.length > 0) {
                    eventTargets.forEach(eventTarget => {
                      const { type: eventTargetType, props: eventTargetProps } = eventTarget;
                      if (eventTargetType === 'component') {
                        dispatchToComponent(eventTargetProps, payload, dispatch, helpers);
                      }
                    });
                    if (innerTasks[dispatchType] && innerTasks[dispatchType].length > 0) {
                      innerTasks[dispatchType].forEach(task => {
                        task.apply(null, [payload])(dispatch, getState, helpers);
                      });
                    }
                  }
                });
                if (userFunctionResult && userFunctionResult.then) {
                  userFunctionResult.catch(error => {
                    caughtExceptionFunction(error);
                  });
                }
              } catch (error) {
                caughtExceptionFunction(error);
              }
            };
          });
        }
      } else if (type === 'component' && props) {
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

function createActions (eventHandlers) {
  const actions = {};
  if (eventHandlers && eventHandlers.length > 0) {
    eventHandlers.forEach(eventHandler => {
      const { name, targets } = eventHandler;
      const tasks = createTasks(targets);
      // console.info('Event handler: ', eventHandler);
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
    actions = createActions(eventHandlers);
    actionsCache.set(eventHandlersKey, actions);
  }
  return actions;
};
