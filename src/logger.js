import {isNil} from 'lodash';

class Logger {

  static ERRORS = {
    mappingExists(id) {
      return `Transport with id '${id}' would be overriden. To override existing
      mapping use <Logger.prototype.overrideTransport>`;
    },
    invalidId: 'Cannot map <null> or <undefined>'
  }

  STATES = {
    stopped: 'stopped',
    running: 'running'
  }

  /**
   * Creates a Logger.
   */
  constructor() {
    this._state = this.STATES.stopped;
    this._transports = {};
  }

  /**
   * Starts logging.
   */
  start() {
    this._state = this.STATES.running;
  }

  /**
   * Stops logging.
   */
  stop() {
    this._state = this.STATES.stopped;
  }

  /**
   * Adds transport to logger.
   * @param {String}  id  Not yet taken id for transport.
   * @param {LoggingTransport|*} transport Logging transport.
   * @param {Boolean} [shouldOverride=false] Flag indicating that transport
   * should be overriden.
   * @throws {Error} Will throw an error if the id argument is not a string.
   * @throws {Error} Will throw an error if the transport would override
   * existing one.
   */
  addTransport(id, transport, shouldOverride = false) {
    if (isNil(id) || !(id && transport)) {
      throw new Error(this.constructor.ERRORS.invalidId);
    }
    if (this.hasTransport(id) && !shouldOverride) {
      throw new Error(this.constructor.ERRORS.mappingExists(id));
    }
    this._transports[id] = transport;
  }

  /**
   * Override existing transport.
   * @param  {String} id        Transport's mapping id.
   * @param  {LoggingTransport|*} transport Logging transport.
   */
  overrideTransport(id, transport) {
    this.addTransport(id, transport, true);
  }

  /**
   * Returns transport.
   * @param  {String} id Transport's id.
   * @return {LoggingTransport|*|undefined)
   */
  getTransport(id) {
    return this._transports[id];
  }

  /**
   * Evaluates if transport exists.
   * @param  {String}  id  Transport's mapping id.
   * @return {Boolean}
   */
  hasTransport(id) {
    return (!isNil(this._transports[id]));
  }

  /**
   * Removes transport from logger's transports.
   * @param  {String} id Transport's id.
   */
  removeTransport(id) {
    if (this._transports[id]) {delete this._transports[id];}
  }

  getTransports() {
    return Object.values(this._transports);
  }

  getMappings() {
    return this._transports;
  }

  /**
   * Evaluates if logger is in state.
   * @param  {String}  expectedState One of available states.
   * @return {Boolean}
   */
  hasState(expectedState) {
    return (this._state === expectedState);
  }

  /**
   * Evaluates if logger is in 'running' state.
   * @return {Boolean}
   */
  isRunning() {
    return this.hasState(this.STATES.running);
  }

  /**
   * Evaluates if logger is in 'stopped' state.
   * @return {Boolean}
   */
  isStopped() {
    return this.hasState(this.STATES.stopped);
  }

  /**
   * Logs message with 'debug' level.
   * @param  {...*} args Any type that transport supports.
   */
  debug(...args) {
    this._log('debug', args);
  }

  /**
   * Logs message with 'info' level.
   * @param  {...*} args Any type that transport supports.
   */
  info(...args) {
    this._log('info', args);
  }

  /**
   * Logs message with 'warning' level.
   * @param  {...*} args Any type that transport supports.
   */
  warning(...args) {
    this._log('warning', args);
  }

  /**
   * Logs message with 'error' level.
   * @param  {...*} args Any type that transport supports.
   */
  error(...args) {
    this._log('error', args);
  }

  /**
   * Logs message with level.
   * @param  {String} level Supported logging level by logging library.
   * @param  {...*} args Any type that transport supports.
   */
  _log(level, args) {
    if (!this.hasState(this.STATES.running)) {return;}

    for (let adapter of this.getTransports()) {
      adapter[level](...args);
    }
  }
}

export default Logger;
