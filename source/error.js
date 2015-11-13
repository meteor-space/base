Space.Object.extend(Space, 'Error', _.extend({}, Error.prototype, {
  Constructor: function() {
    let tmp = Error.apply(this, arguments);
    tmp.name = this.name = this.constructor.name;
    if (tmp.message) this.message = tmp.message;
    this.stack = tmp.stack;
  }
}));
