import {isNil} from 'lodash';

class LoggingTransport {

  static ERRORS = {
    undefinedLibrary: 'Logging library is required',
    invalidLibrary: `Library can't be <null> or <undefined>`
  }

  /**
   * Create a LoggingTransport.
   * @param  {*} lib Logging library.
   */
  constructor(lib) {
    if (isNil(lib)) {throw new Error(this.constructor.ERRORS.undefinedLibrary);}
    this.setLibrary(lib);
  }

  /**
   * Sets logging library.
   * @param {*} lib Logging library.
   */
  setLibrary(lib) {
    if (isNil(lib)) {
      throw new Error(this.constructor.ERRORS.invalidLibrary);
    }
    this._lib = lib;
  }

  /**
   * Returns logging library.
   * @return {*} Logging library.
   */
  getLibrary() {
    return this._lib;
  }

  /**
   * Logs message with 'debug' level.
   * @param  {...*} args Any type that logging library supports.
   */
  debug(...args) {
    this._log('debug', args);
  }

  /**
   * Logs message with 'info' level.
   * @param  {...*} args Any type that logging library supports.
   */
  info(...args) {
    this._log('info', args);
  }

  /**
   * Logs message with 'warning' level.
   * @param  {...*} args Any type that logging library supports.
   */
  warning(...args) {
    this._log('warning', args);
  }

  /**
   * Logs message with 'error' level.
   * @param  {...*} args Any type that logging library supports.
   */
  error(...args) {
    this._log('error', args);
  }

  /**
   * Logs message with level.
   * @param  {String} level Supported logging level by logging library.
   * @param  {...*} args Any type that logging library supports.
   */
  _log(level, args) {
    this._lib[level](...args);
  }
}

export default LoggingTransport;
