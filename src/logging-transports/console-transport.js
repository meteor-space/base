import LoggingTransport from './logging-transport.js';
import {isNil} from 'lodash';

class ConsoleTransport extends LoggingTransport {

  /**
   * Create a ConsoleTransport.
   * @param  {*} lib Logging library.
   */
  constructor() {
    super(console);
  }

  /**
   * Logs message with 'debug' level. 'console.debug' is not supported on Node.js
   * @param  {...*} args Any type that console supports.
   */
  debug(...args) {
    if (isNil(this._lib.debug)) {
      this._log('log', args);
    } else {
      this._log('debug', args);
    }
  }

  /**
   * Logs message with 'warning' level. 'console.warn' is not supported on Node.js
   * @param  {...*} args Any type that console supports.
   */
  warning(...args) {
    this._log('warn', args);
  }
}

export default ConsoleTransport;
