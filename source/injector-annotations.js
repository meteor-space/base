import _ from 'underscore';
import {isNil} from 'lodash';
import Space from './space.js';

Space.Dependency = function(propertyName, dependencyId) {
  return function(target) {
    const proto = target.prototype;
    if (proto.dependencies && !proto.hasOwnProperty('Dependencies')) {
      proto.dependencies = _.clone(proto.dependencies);
    }
    if (isNil(proto.dependencies)) {proto.dependencies = {};}
    proto.dependencies[propertyName] = dependencyId || propertyName;
    return target;
  };
};

Space.RequireModule = function(moduleId) {
  return function(target) {
    const proto = target.prototype;
    if (proto.requiredModules && !proto.hasOwnProperty('RequiredModules')) {
      proto.requiredModules = _.clone(proto.requiredModules);
    }
    if (isNil(proto.requiredModules)) {proto.requiredModules = [];}
    proto.requiredModules.push(moduleId);
    return target;
  };
};
