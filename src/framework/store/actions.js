import forOwn from 'lodash/forOwn';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import { getUserFunctionByName } from './sequences';

const createTasks = (targets) => {
  const tasks = [];
  if (targets && targets.length > 0) {
    targets.forEach(target => {
      const { type, props, event } = target;
      if (type === 'userFunction' && props) {
        const func = getUserFunctionByName(props.functionName);
        console.info('Create tasks (props.functionName): ', props.functionName, func);
        if (func) {
          let innerTasks = [];
          if (event && event.targets) {
            console.info('Create tasks (event.targets): ', props.functionName, event.targets);
            innerTasks = createTasks(event.targets);
          }
          tasks.push(function () {
            const args = arguments;
            return (dispatch, getState, helpers) => {
              func.apply(null, args)((type, payload) => {
                if (
                  type
                  && payload
                  && event
                  && event.name === type
                  && event.targets
                  && event.targets.length > 0
                ) {
                  //
                  event.targets.forEach(eventTarget => {
                    const { type: eventTargetType, props: eventTargetProps } = eventTarget;
                    if (eventTargetProps) {
                      if (eventTargetType === 'component') {
                        const {
                          pageName, componentName, componentInstance, propertyName, forwardRule
                        } = eventTargetProps;
                        const targetKey = `${pageName}_${componentName}_${componentInstance}`;
                        if (forwardRule && helpers) {
                          const { history } = helpers;
                          if (history) {
                            let pathString = pageName;
                            const {hasParameters: forwardWithParameters} = forwardRule;
                            if (forwardWithParameters) {
                              if (isNumber(payload) || isString(payload)) {
                                pathString = `${pathString}/${payload}`;
                              } else if (isObject(payload)) {
                                forOwn(payload, (value, prop) => {
                                  if (!isObject(value) && !isArray(value)) {
                                    pathString = `${pathString}/${value}`;
                                  }
                                });
                              }
                            } else {
                              dispatch({ type: targetKey, payload: { [propertyName]: payload } });
                            }
                            history.push(pathString);
                          }
                        } else {
                          dispatch({ type: targetKey, payload: { [propertyName]: payload } });
                        }
                      }
                    }
                  });
                  console.info('Inner tasks: ', innerTasks);
                  if (innerTasks.length > 0) {
                    innerTasks.forEach(task => {
                      task.apply(null, [payload])(dispatch);
                    });
                  }
                }
              });
            };
          });
        }
      }
    });
  }
  return tasks;
};

export default eventHandlers => {
  const actions = {};
  if (eventHandlers && eventHandlers.length > 0) {
    eventHandlers.forEach(eventHandler => {
      const { name, targets } = eventHandler;
      const tasks = createTasks(targets);
      console.info('Event handler: ', eventHandler);
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
};
