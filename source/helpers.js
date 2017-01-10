import {isNil, get, capitalize} from 'lodash';
import Space from './namespace.js';

const global = this;

// Resolves a (possibly nested) path to a global object
// Returns the object or null (if not found)
Space.resolvePath = function(path) {
  if (isNil(path)) {throw new Error(`Cannot resolve invalid path <${path}>`);}
  if (path === '') {return global;}

  // If there is a direct reference just return it
  if (Space.registry && !isNil(Space.registry[path])) {
    return Space.registry[path];
  }
  if (get(Space, `Module.published.${path}`)) {
    return Space.Module.published[path];
  }
  parts = path.split('.');
  result = global; // Start with global namespace
  for (let key of parts) { // Move down the object chain
    result = get(result, key);
    // Take published space modules into account
    // to solve the Meteor package scoping problem
    if (isNil(result)) {
      throw new Error("Could not resolve path '" + path + "'");
    }
  }
  return result;
};

Space.namespace = function(id) {
  Space.registry[id] = new Space.Namespace(id);
  return Space.registry[id];
};

// @backward {space:base} <= 4.1.3
Space.capitalizeString = capitalize;
