Space.Object.extend(Space, 'Error', _.extend({}, Error.prototype, {
  Constructor: function() {
    var tmp = Error.apply(this, arguments);
    tmp.name = this.name = this.constructor.name;
    this.message = tmp.message;
    this.stack = tmp.stack;
  }
}));
