// Recursive solution for getting all the keys in an object, including of deeply nested objects and objects inside arrays
const isArray = (object) => {
  return Array.isArray(object);
};

const isObject = (object) => {
  return Object.prototype.toString.call(object) === "[object Object]";
};

function getObjectProperties(object) {
  let properties = [];

  for (const property in object) {
    properties.push(property);

    if (isArray(object[property])) {
      let tempArray = iterateOverArray(object[property]);
      properties = [...properties, ...tempArray];
    }

    if (isObject(object[property])) {
      let tempArray = iterateOverObject(object[property]);
      properties = [...properties, ...tempArray];
    }
  }

  return properties;
}

const iterateOverArray = (array) => {
  let properties = [];

  for (var i = 0; i < array.length; i++) {
    if (isObject(array[i])) {
      let tempArray = iterateOverObject(array[i]);

      properties = [...tempArray];
    }

    if (isArray(array[i])) {
      let tempArray = iterateOverArray(array[i]);
      properties = [...tempArray];
    }
  }

  return properties;
};

const iterateOverObject = (object) => {
  let properties = [];

  for (const property in object) {
    properties.push(property);

    if (isObject(object[property])) {
      let tempArray = iterateOverObject(object[property]);
      properties = [...properties, ...tempArray];
    }

    if (isArray(object[property])) {
      let tempArray = iterateOverArray(object[property]);
      properties = [...properties, ...tempArray];
    }
  }

  return properties;
};

exports.getObjectProperties = getObjectProperties;
