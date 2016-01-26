
Space.Module.extend('Space.Application', {

  statics: {
    define(classPath, prototype) {
      return this.extend(classPath, prototype);
    }
  },

  configuration: {
    appId: null
  },

  Constructor(options = {}) {
    Space.Module.apply(this, arguments);
    this.modules = {};
    this.configuration = options.configuration || {};
    this.constructor.publishedAs = this.constructor.name;
    this.initialize(this, options.injector || new Space.Injector());
  },

  // Make it possible to override configuration (at any nested level)
  configure(options) {
    _.deepExtend(this.configuration, options);
  }
});
