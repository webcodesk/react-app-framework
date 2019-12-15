export function pickInObject(object, validKeys) {
  const result = {};
  if (object && validKeys && validKeys.length > 0) {
    for (let i = 0; i < validKeys.length; i++) {
      if (object.hasOwnProperty(validKeys[i])) {
        result[validKeys[i]] = object[validKeys[i]];
      }
    }
  }
  return result;
}

export function omitInObject(object, validKeys) {
  let result = {};
  if (object) {
    result = {...object};
    if (validKeys && validKeys.length > 0) {
      for (let i = 0; i < validKeys.length; i++) {
        if (result.hasOwnProperty(validKeys[i])) {
          delete result[validKeys[i]];
        }
      }
    }
  }
  return result;
}
