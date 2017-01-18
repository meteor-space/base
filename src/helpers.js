import {isNil} from 'lodash';

// http://stackoverflow.com/questions/30758961/how-to-check-if-a-variable-is-an-es6-class-declaration
/**
 * Evaluates if provided value is a class. Its quite wonky.
 * @param  {*}  value
 * @return {Boolean}
 */
const isClass = function(value) {
  if (typeof value !== 'function') {
    return false;
  }
  try {
    value();
    return false;
  } catch (error) {
    if (
        /^Class constructor|^Cannot call a class as a function/.test(error.message)
    ) {
      return true;
    }
    return false;
  }
};

/**
 * Returns parent class.
 * @param  {*} ES6 Class or instance of a class.
 * @return {*|null} Parent class or null
 */
const parentClass = function(Class) {
  let cnstr;
  if (!isClass(Class)) {
    cnstr = Class.constructor;
  } else {
    cnstr = Class;
  }

  const parent = Object.getPrototypeOf(cnstr);
  if (!isNil(parent) && parent.name !== '' && isClass(parent)) {
    return parent;
  }
  return null;
};

/**
 * Returns parent class prototype.
 * @param  {*} ES6 Class or instance of a class.
 * @return {Object} Prototype of parent class.
 */
const parentClassPrototype = function(Class) {
  let cnstr;
  if (!isClass(Class)) {
    cnstr = Class.constructor;
  } else {
    cnstr = Class;
  }
  const parent = Object.getPrototypeOf(cnstr);

  if (!isNil(parent) && parent.name !== '' && isClass(parent)) {
    return parent.prototype;
  }
  return null;
};


export {
  isClass,
  parentClass,
  parentClassPrototype
};
