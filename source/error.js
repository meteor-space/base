import _ from 'underscore';
import {optional, Integer} from 'simplecheck';

let IntermediateInheritor = function() {};
IntermediateInheritor.prototype = Error.prototype;

Space.Error = function(params) {
  this._invokeConstructionCallbacks.apply(this, arguments);
  let data = null;
  if (_.isString(params)) {
    data = { message: params };
  } else if (_.isObject(params)) {
    data = params;
  } else {
    data = {};
  }
  Space.Struct.call(this, this.extractErrorProperties(data));
  return this;
};

Space.Error.prototype = new IntermediateInheritor();

_.extend(
  Space.Error.prototype, // target
  Space.Struct.prototype,
  _.omit(Space.Object.prototype, 'toString'),
  {
    message: '',
    fields() {
      let fields = Space.Struct.prototype.fields.call(this);
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

_.extend(Space.Error, _.omit(Space.Object, 'toString'), {
  __keepToStringMethod__: true // Do not override #toString method
});

export default Space.Error;
