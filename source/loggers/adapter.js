Space.Object.extend('Space.Logger.Adapter', {

  _lib: null,

  debug(message) {
    check(message, String);
    this._log('debug', arguments);
  },

  info(message) {
    check(message, String);
    this._log('info', arguments);
  },

  warning(message) {
    check(message, String);
    this._log('warning', arguments);
  },

  error(message) {
    check(message, String);
    this._log('error', arguments);
  },

  setLib(lib) {
    this._lib = lib;
  },

  lib() {
    if (!this._lib) {
      throw new Error(this.ERRORS.undefinedLib);
    }
    return this._lib;
  },

  _log(level, message) {
    this._lib[level].apply(this._lib, message);
  },

  ERRORS: {
    undefinedLib: 'Logging library is not set on adapter'
  }

});