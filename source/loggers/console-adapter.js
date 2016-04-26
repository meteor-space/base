Space.Logger.Adapter.extend('Space.Logger.ConsoleAdapter', {

  Constructor() {
    return this.setLib(console);
  },

  warning(message) {
    check(message, String);
    return this._log('warn', arguments);
  }

});