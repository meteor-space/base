import _ from 'underscore';
import {optional, Integer} from 'simplecheck';
import Struct from './struct.js';
import SpaceObject from './object.js';

let IntermediateInheritor = function() {};
IntermediateInheritor.prototype = Error.prototype;

SpaceError = function(params) {
  this._invokeConstructionCallbacks.apply(this, arguments);
  let data = null;
  if (_.isString(params)) {
    data = { message: params };
  } else if (_.isObject(params)) {
    data = params;
  } else {
    data = {};
  }
  new Struct(this.extractErrorProperties(data));
  return this;
};

SpaceError.prototype = new IntermediateInheritor();

_.extend(
  SpaceError.prototype, // target
  Struct.prototype,
  _.omit(SpaceObject.prototype, 'toString'),
  {
    message: '',
    fields() {
      let fields = Struct.prototype.fields.call(this);
      _.extend(fields, {
        name: String,
        message: String,
        stack: optional(String),
        code: optional(Integer)
      });
      return fields;
    },
    extractErrorProperties(data) {
      let message = data.message ? data.message : this.message;
      let error = Error.call(this, message);
      data.name = error.name = this.constructor.name;
      data.message = error.message;
      if (error.stack !== undefined) data.stack = error.stack;
      return data;
    }
  }
);

_.extend(SpaceError, _.omit(SpaceObject, 'toString'), {
  __keepToStringMethod__: true // Do not override #toString method
});

export default SpaceError;
