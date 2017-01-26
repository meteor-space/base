import {
  isString, isArray, isPlainObject, assign, isNil, mapValues
} from 'lodash';

/**
 * Maps dependencies to object from array in relation:
 * nameForDependency: idOfDependency
 * @param  {String[]} ids
 * @return {Object}
 */
const mapDependenciesFromArray = function(ids) {
  const deps = {};
  for (let id of ids) {
    if (isString(id)) {
      deps[id] = id;
    } else {
      deps[id.toString()] = id.toString();
    }
  }
  return deps;
};

/**
 * Processes passed arguments to decorator.
 * @param  {String|String[]| Object} args
 * @return {Object}
 */
const processArguments = function(args) {
  const deps = {};
  for (let arg of args) {
    // @dependencies('my-dependency')
    // @dependencies(MyClas'my-dependency')
    if (isString(arg)) {
      deps[arg] = arg;
    // @dependencies(['dependency-1', 'dependency-2'])]
    // @dependencies([MyClass, 'dependency-2'])]
    } else if (isArray(arg)) {
      assign(deps, mapDependenciesFromArray(arg));
    // @dependencies({'mapping': 'dependency'})
    // @dependencies({'mapping': MyClass})
    } else if (isPlainObject(arg)) {
      const sanitized = mapValues(arg, (value) => {
        return value.toString();
      });
      assign(deps, sanitized);
    // @dependencies(MyClass)
    } else {
      deps[arg.toString()] = arg.toString();
    }
  }
  return deps;
};

/**
 * Maps processed dependencies to target's prototype.
 * @param  {...*} args Argument with type of string, array with strings, object.
 * @example
 * dependencies('dependency')(MyClass)
 * dependencies(['dependency-1', 'dependency-2'])(MyClass)
 * dependencies({'mapping': 'dependency', 'other-mapping': 'other-dependency'})(MyClass)
 */
const dependencies = function(...args) {
  return function(target) {
    const deps = processArguments(args);
    if (isNil(target.prototype.dependencies)) {
      target.prototype.dependencies = {};
    }
    target.prototype.dependencies = deps;
  }
};

export default dependencies;
