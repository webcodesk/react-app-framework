import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import {STORE_ITEM_ACTION_GET, STORE_ITEM_ACTION_SET} from './constants';

const storeItemsMap = new Map();

export function resetStoreItems() {
  storeItemsMap.clear();
}

function testPrimaryArgument(primaryArgument) {
  return primaryArgument
    && !isArray(primaryArgument)
    && !isNumber(primaryArgument)
    && !isString(primaryArgument)
    && isObject(primaryArgument);
}

const storeItemFunction = (primaryArgument, secondaryArgument) => (dispatch) => {
  let foundStoreItem = null;
  if (secondaryArgument) {
    const {storeItemName, storeItemAction} = secondaryArgument;
    if (storeItemName && storeItemName.length > 0 && storeItemAction && storeItemAction.length > 0) {
      if (storeItemAction === STORE_ITEM_ACTION_SET) {
        // search for the existing item
        foundStoreItem = storeItemsMap.get(storeItemName);
        if (foundStoreItem) {
          // we found item, now test the new one if this is an object
          if (testPrimaryArgument(primaryArgument)) {
            // the new is a real object and we have to merge the existing item with the new one
            foundStoreItem = {...foundStoreItem, ...primaryArgument};
          } else {
            // remove existing item if the primary argument is undefined or null or string or whatever that is not an object
            storeItemsMap.delete(storeItemName);
          }
        } else {
          // we didn't find the existing item, so test the new object
          if (testPrimaryArgument(primaryArgument)) {
            foundStoreItem = {...primaryArgument};
          }
        }
        if (foundStoreItem) {
          // save the new item: merged or new one
          storeItemsMap.set(storeItemName, foundStoreItem);
        }
      } else if (storeItemAction === STORE_ITEM_ACTION_GET) {
        // search for the existing item
        foundStoreItem = storeItemsMap.get(storeItemName);
      }
    }
  }
  dispatch('result', foundStoreItem);
};

export default {
  framework: {
    storeItemFunction,
  }
};
