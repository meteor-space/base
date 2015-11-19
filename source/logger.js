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
          new (winston.transports.Console)({
            colorize: true,
            prettyPrint: true
          })
        ]
      });
      this._logger.setLevels(winston.config.syslog.levels);
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

  debug(message, meta) {
    check(message, String);
    if (this._shouldLog()) this._logger.debug.apply(this, arguments);
  },

  info(message, meta) {
    check(message, String);
    if (this._shouldLog()) this._logger.info.apply(this, arguments);
  },

  notice(message, meta) {
    check(message, String);
    if (this._shouldLog()) this._logger.notice.apply(this, arguments);
  },

  warning(message, meta) {
    check(message, String);
    if (this._shouldLog()) this._logger.warning.apply(this, arguments);
  },

  error(message, meta) {
    check(message, String);
    if (this._shouldLog()) this._logger.error.apply(this, arguments);
  },

  crit(message, meta) {
    check(message, String);
    if (this._shouldLog()) this._logger.crit.apply(this, arguments);
  },

  alert(message, meta) {
    check(message, String);
    if (this._shouldLog()) this._logger.alert.apply(this, arguments);
  },

  emerg(message, meta) {
    check(message, String);
    if (this._shouldLog()) this._logger.emerg.apply(this, arguments);
  },

  _shouldLog() {
    if (this._state === 'running') return true;
  }

});

// System log
Space.log = new Space.Logger();

if (Space.configuration.sysLog.enabled) {
  Space.log.start();
}
