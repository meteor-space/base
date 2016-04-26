Space.Object.extend('Space.Logger', {

  _state: 'stopped',

  Constructor() {
    return this._adapters = {};
  },

  addAdapter(id, adapter, override) {
    if (override == null) {
      let override = false;
    }
    if (id == null) {
      throw new Error(this.ERRORS.cannotMapUndefinedId());
    }
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
    if (this._is('stopped')) {
      return this._state = 'running';
    }
  },

  stop() {
    if (this._is('running')) {
      return this._state = 'stopped';
    }
  },

  debug(message) {
    return this._log('debug', arguments);
  },

  info(message) {
    return this._log('info', arguments);
  },

  warning(message) {
    if (Meteor.isClient) {
      this._log('warn', arguments);
    }
    if (Meteor.isServer) {
      return this._log('warning', arguments);
    }
  },

  error(message) {
    return this._log('error', arguments);
  },

  _is(expectedState) {
    if (this._state === expectedState) {
      return true;
    }
  },

  _log(level, message) {
    if (!this._is('running')) {
      return;
    }

    _.each(this._adapters, function(adapter, id) {
      adapter[level].apply(adapter, message);
    });
  },

  ERRORS: {
    cannotMapUndefinedId() {
      return "Cannot add adapter with <null> or <undefined> id";
    },
    mappingExists(id) {
      return `Adapter with id <${id}> would be overwritten. Use method <Space.Logger::overrideAdapter> for that`;
    }
  }
});
