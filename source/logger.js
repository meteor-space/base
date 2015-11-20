let config = Space.configuration;

if (Meteor.isServer) {
  winston = Npm.require('winston');
}

Space.Object.extend(Space, 'Logger', {

  _logger: null,
  _minLevel: 6,
  _state: 'stopped',

  _levels: {
    'error': 3,
    'warning': 4,
    'warn': 4,
    'info': 6,
    'debug': 7
  },

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
    if (this._is('stopped')) {
      this._state = 'running';
    }
  },

  stop() {
    if (this._is('running')) {
      this._state = 'stopped';
    }
  },

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
    if (Meteor.isClient)
      this._log('warn', arguments);
    if (Meteor.isServer)
      this._log('warning', arguments);
  },

  error(message) {
    check(message, String);
    this._log('error', arguments);
  },

  _levelCode(name) {
    return this._levels[name];
  },

  _is(expectedState) {
    if (this._state === expectedState) return true;
  },

  _log(level, message) {
    if(this._is('running') && this._levelCode(level) <= this._minLevel) {
      this._logger[level].apply(this._logger, message);
    }
  }

});

Space.log = new Space.Logger();

if (config.log.enabled) {
  Space.log.setMinLevel(config.log.minLevel);
  Space.log.start();
}
