if (Meteor.isServer) {
  winston = Npm.require('winston');
}

Space.Logger = Space.Object.extend(Space, 'Logger', {

  _logger: null,
  _state: 'stopped',

  Constructor() {

    if (Meteor.isServer) {
      this._logger = new (winston.Logger)({
        transports: [
          new (winston.transports.Console)()
        ]
      });
    }
    if (Meteor.isClient) {
      this._logger = console;
    }
  },

  start() {
    if (this._state === 'stopped') {
      this._state = 'running';
    }
  },

  stop() {
    if (this._state === 'running') {
      this._state = 'stopped';
    }
  },

  info(message) {
    if (this.shouldLog()) this._logger.info(message);
  },

  warn(message) {
    if (this.shouldLog()) this._logger.warn(message);
  },

  error(message) {
    if (this.shouldLog()) this._logger.error(message);
  },

  shouldLog() {
    if (this._state === 'running') return true;
  }

});

// System log
Space.log = new Space.Logger();

if (Space.configuration.sysLog.enabled) {
  Space.log.start();
}
