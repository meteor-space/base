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
  let message = data.message ? data.message : this.message;
  let error = Error.call(this, message);
  error.name = this.name = this.constructor.name;
  data.message = error.message;
  data.stack = error.stack;
  Space.Struct.call(this, data);
  return this;
};

Space.Error.prototype = new IntermediateInheritor();

_.extend(Space.Error.prototype, {
  message: '',
  fields() {
    let fields = Space.Struct.prototype.fields.call(this);
    _.extend(fields, {
      message: String,
      stack: String,
      code: Match.Optional(Match.Integer)
    });
    return fields;
  },
  toPlainObject: Space.Struct.prototype.toPlainObject,
  _getMixinCallbacks: Space.Object.prototype._getMixinCallbacks,
  onDependenciesReady: Space.Object.prototype.onDependenciesReady
});

_.extend(Space.Error, {
  extend: Space.Object.extend,
  mixin: Space.Object.mixin,
  create: Space.Object.create,
  _applyMixin: Space.Object._applyMixin,
  __keepToStringMethod__: true // Do not override #toString method
});
