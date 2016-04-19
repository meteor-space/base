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

  Constructor(logger) {
    this._logger = logger;
  },

  addTransport() {
    this._logger.add.apply(this._logger, arguments);
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
