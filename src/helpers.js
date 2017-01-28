import {isNil} from 'lodash';
import cloneFunction from 'clone-function';

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
    /*
    TODO:
    Currently there is no way to test if provided value is ES6 class without
    actually making the call to it and catching thrown error. And that breaks
    any call count assertions.

    Ideally replace this with:
    1. A valid way of evaluating if passed value is a class.
    2. Creating a ideal duplicate of class and proceeding with thrown
    error checking.
     */
    const clonedValue = cloneFunction(value);
    clonedValue();
    return false;
  } catch (error) {
    if (
        /^Class constructor|^Cannot call a class as a function|^_classCallCheck3 is not defined/.test(error.message)
    ) {
      return true;
    }
    return false;
  }
};

/**
 * Returns parent class.
 * @param  {*} ES6 Class or instance of a class.
 * @return {*|undefined} Parent class or null
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
  return undefined;
};

/**
 * Returns parent class prototype.
 * @param  {*} ES6 Class or instance of a class.
 * @return {Object|undefined} Prototype of parent class.
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
  return undefined;
};


export {
  isClass,
  parentClass,
  parentClassPrototype
};
