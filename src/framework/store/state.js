import forOwn from 'lodash/forOwn';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isObject';

function createArrayState (arrayModel, initialState) {
  let result = undefined;
  if (arrayModel.length > 0) {
    let descriptionItem;
    let resultItem;
    for (let i = 0; i < arrayModel.length; i++) {
      descriptionItem = arrayModel[i];
      if (descriptionItem) {
        if (isArray(descriptionItem)) {
          resultItem = createArrayState(descriptionItem, initialState);
          if (resultItem) {
            result = result || [];
            result.push(resultItem);
          }
        } else if (isPlainObject(descriptionItem)) {
          if (descriptionItem.type && descriptionItem.instance) {
            createComponentState(descriptionItem, initialState);
          } else {
            resultItem = createShapeState(descriptionItem, initialState);
            if (resultItem) {
              result = result || [];
              result.push(resultItem);
            }
          }
        } else {
          result = result || [];
          result.push(descriptionItem);
        }
      } else {
        result = result || [];
        result.push(descriptionItem);
      }
    }
  }
  return result;
}

function createShapeState (shapeModel, initialState) {
  let result;
  let resultItem;
  forOwn(shapeModel, (value, prop) => {
    if (value) {
      if (isArray(value)){
        resultItem = createArrayState(value, initialState);
        if (resultItem) {
          result = result || {};
          result[prop] = resultItem
        }
      } else if (isPlainObject(value)) {
        if (value.type && value.instance) {
          createComponentState(value, initialState);
        } else {
          resultItem = createShapeState(value, initialState);
          if (resultItem) {
            result = result || {};
            result[prop] = resultItem
          }
        }
      } else {
        result = result || {};
        result[prop] = value;
      }
    } else {
      result = result || {};
      result[prop] = value;
    }
  });
  return result;
}

function createComponentState(componentModel, initialState) {
  if (componentModel) {
    const { type, instance, props } = componentModel;
    if (props) {
      const key = `${type}_${instance}`;
      initialState[key] = createShapeState(props, initialState);
    }
  }
}

export function createInitialState(pages) {
  let initialState = {};
  if (pages) {
    forOwn(pages, value => {
        createComponentState(value, initialState);
    });
  }
  return initialState;
}