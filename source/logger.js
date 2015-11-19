let config = Space.configuration;

if (Meteor.isServer) {
  winston = Npm.require('winston');
}

Space.Object.extend(Space, 'Logger', {

  _logger: null,
  _minLevel: 6,
  _state: 'stopped',

  Constructor() {
    if (Meteor.isServer) {
      this._logger = new winston.Logger({
        transports: [
          new winston.transports.Console({
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

  setMinLevel(name) {
    let newCode = this._levelCode(name);
    if (this._minLevel !== newCode) {
      this._minLevel = newCode;
      if (Meteor.isServer) {
        this._logger.transports.console.level = name;
      }
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

  debug(message) {
    check(message, String);
    if (this._isRunning()) this._logger.debug.apply(this, arguments);
  },

  info(message) {
    check(message, String);
    if (this._isRunning()) this._logger.info.apply(this, arguments);
  },

  notice(message) {
    check(message, String);
    if (this._isRunning()) this._logger.notice.apply(this, arguments);
  },

  warning(message) {
    check(message, String);
    if (this._isRunning()) this._logger.warning.apply(this, arguments);
  },

  error(message) {
    check(message, String);
    if (this._isRunning()) this._logger.error.apply(this, arguments);
  },

  crit(message) {
    check(message, String);
    if (this._isRunning()) this._logger.crit.apply(this, arguments);
  },

  alert(message) {
    check(message, String);
    if (this._isRunning()) this._logger.alert.apply(this, arguments);
  },

  emerg(message) {
    check(message, String);
    if (this._isRunning()) this._logger.emerg.apply(this, arguments);
  },

  _levelCode(name) {
    let code = {
      'emerg': 0,
      'alert': 1,
      'crit': 2,
      'error': 3,
      'warning': 4,
      'notice': 5,
      'info': 6,
      'debug': 7
    };
    return code[name];
  },

  _isRunning() {
    if (this._state === 'running') return true;
  }

});

// System log
Space.log = new Space.Logger();

if (config.log.enabled) {
  Space.log.setMinLevel(config.log.minLevel);
  Space.log.start();
}
