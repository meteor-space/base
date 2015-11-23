let IntermediateInheritor = function() {};
IntermediateInheritor.prototype = Error.prototype;

Space.Error = function() {
  let tmp = Error.apply(this, arguments);
  tmp.name = this.name = this.constructor.name;
  if (tmp.message) this.message = tmp.message;
  this.stack = tmp.stack;
  return this;
};

Space.Error.prototype = new IntermediateInheritor();

Space.Error.extend = Space.Object.extend;

Space.Error.__keepToStringMethod__ = true;
