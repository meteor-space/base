Space.Object.extend('Space.Logger', {

  STATES: {
    stopped: 'stopped',
    running: 'running'
  },

  Constructor() {
    this._state = this.STATES.stopped;
    return this._adapters = {};
  },

  addAdapter(id, adapter, override) {
    if (override == null) {
      let override = false;
    }
    check(id, String);
    if (this.existsAdapter(id) && !override) {
      throw new Error(this.ERRORS.mappingExists(id));
    }
    check(adapter, Space.Logger.Adapter);
    return this._adapters[id] = adapter;
  },

  overrideAdapter(id, item) {
    return this.addAdapter(id, item, true);
  },

  adapter(id) {
    return this._adapters[id] || null;
  },

  existsAdapter(id) {
    return (this._adapters[id] != null);
  },

  removeAdapter(id) {
    if (this._adapters[id]) {
      return delete this._adapters[id];
    }
  },

  adapters() {
    return this._adapters;
  },

  start() {
    if (this._is(this.STATES.stopped)) {
      return this._state = this.STATES.running;
    }
  },

  stop() {
    if (this._is(this.STATES.running)) {
      return this._state = this.STATES.stopped;;
    }
  },

  debug(message) {
    return this._log('debug', arguments);
  },

  info(message) {
    return this._log('info', arguments);
  },

  warning(message) {
    return this._log('warning', arguments);
  },

  error(message) {
    return this._log('error', arguments);
  },

  _is(expectedState) {
    return (this._state === expectedState);
  },

  isRunning() {
    return this._is(this.STATES.running);
  },

  isStopped() {
    return this._is(this.STATES.stopped);
  },

  _log(level, message) {
    if (!this._is(this.STATES.running)) {
      return;
    }

    _.each(this._adapters, function(adapter, id) {
      adapter[level].apply(adapter, message);
    });
  },

  ERRORS: {
    mappingExists(id) {
      return `Adapter with id <${id}> would be overwritten. Use method <Space.Logger::overrideAdapter> for that`;
    }
  }
});
