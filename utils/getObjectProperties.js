// Recursive solution for getting all the keys in an object, including of deeply nested objects and objects inside arrays
function getObjectProperties(object, props) {
  let properties = props || [];

  for (const property in object) {
    properties.push(property);

    if (object[property].length > 0 && typeof object[property] !== "string") {
      let tempArray = iterateOverArray(object[property]);
      properties = [...properties, ...tempArray];
    }

    if (!object[property].length && typeof object[property] === "object") {
      let tempArray = iterateOverObject(object[property]);
      properties = [...properties, ...tempArray];
    }
  }

  return properties;
}

const iterateOverArray = (array, props) => {
  let properties = props || [];

  for (var i = 0; i < array.length; i++) {
    if (typeof array[i] === "object" && !array[i].length) {
      let tempArray = iterateOverObject(array[i]);

      properties = [...properties, ...tempArray];
    }

    if (typeof array[i] === "object" && array[i].length > 0) {
      let tempArray = iterateOverArray(array[i], properties);
      properties = [...properties, ...tempArray];
    }
  }

  return properties;
};

const iterateOverObject = (object) => {
  let properties = [];

  for (const property in object) {
    properties.push(property);

    if (typeof object[property] === "object" && !object[property].length) {
      let tempArray = iterateOverObject(object[property]);
      properties = [...properties, ...tempArray];
    }

    if (typeof object[property] === "object" && object[property].length > 0) {
      let tempArray = iterateOverArray(object[property]);
      properties = [...properties, ...tempArray];
    }
  }

  return properties;
};

exports.getObjectProperties = getObjectProperties;
