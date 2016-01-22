let IntermediateInheritor = function() {};
IntermediateInheritor.prototype = Error.prototype;

Space.Error = function(params) {
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

_.extend(Space.Error.prototype, {
  message: '',
  fields() {
    let fields = Space.Struct.prototype.fields.call(this);
    _.extend(fields, {
      name: String,
      message: String,
      stack: Match.Optional(String),
      code: Match.Optional(Match.Integer)
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
  },
  toPlainObject: Space.Struct.prototype.toPlainObject,
  _checkFields: Space.Struct.prototype._checkFields,
  _assignData: Space.Struct.prototype._assignData,
  _getMixinCallbacks: Space.Object.prototype._getMixinCallbacks,
  onDependenciesReady: Space.Object.prototype.onDependenciesReady
});

_.extend(Space.Error, {
  extend: Space.Object.extend,
  mixin: Space.Object.mixin,
  create: Space.Object.create,
  type: Space.Object.type,
  _applyMixin: Space.Object._applyMixin,
  _mergeIntoPrototype: Space.Object._mergeIntoPrototype,
  __keepToStringMethod__: true // Do not override #toString method
});
