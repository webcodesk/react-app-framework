import queryString from 'query-string';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import { getUserFunctionByName } from './sequences';

const dispatchToComponent = (props, payload, dispatch, helpers) => {
  if (props) {
    const {
      pageName, componentName, componentInstance, propertyName, isForward, forwardRule
    } = props;
    const targetKey = `${pageName}_${componentName}_${componentInstance}`;
    if (isForward && helpers) {
      const { history } = helpers;
      if (history) {
        let pathString = `/${pageName}`;
        const {withParams, withQuery} = forwardRule || {};
        if (withParams) {
          if (!payload) {
            console.error(`Cannot add parameters to "${pathString}" URL due to undefined payload. Remove forward with parameters setting or pass not null value in the dispatch`)
          } else {
            if (isNumber(payload) || isString(payload)) {
              pathString = `${pathString}/${payload}`;
            } else if (isObject(payload) || isArray(payload)) {
              console.error(`The mapping to parameters in URL is possible only for primitives.`);
            }
          }
        } else if (withQuery) {
          if (!payload) {
            console.error(`Cannot add parameters to "${pathString}" URL due to undefined payload. Remove forward with parameters setting or pass not null value in the dispatch`)
          } else {
            if (isNumber(payload) || isString(payload)) {
              pathString = `${pathString}?${propertyName}=${payload}`;
            } else if (isObject(payload) || isArray(payload)) {
              pathString = `${pathString}?${queryString.stringify(payload)}`;
            }
          }
        } else {
          dispatch({ type: targetKey, payload: { [propertyName]: payload } });
        }
        console.info('Actions forward to: ', pathString);
        history.push(pathString);
      }
    } else {
      dispatch({ type: targetKey, payload: { [propertyName]: payload } });
    }
  }
};

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
                console.info('Apply action with dispatch: ', type);
                if (
                  type
                  && event
                  && event.name === type
                  && event.targets
                  && event.targets.length > 0
                ) {
                  //
                  console.info('Apply action with event: ', event);
                  event.targets.forEach(eventTarget => {
                    const { type: eventTargetType, props: eventTargetProps } = eventTarget;
                    if (eventTargetType === 'component') {
                      dispatchToComponent(eventTargetProps, payload, dispatch, helpers);
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
          }
        });
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
