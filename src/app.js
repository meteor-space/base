import {isNil} from 'lodash';
import Module from './module.js';
import {Injector} from './injector.js';
import Logger from './logger.js';
import ConsoleTransport from './logging-transports/console-transport.js';
import deepExtend from 'deep-extend';

class App extends Module {

  /**
   * Create a Application.
   * @param  {Object} properties Additional or overriding properties for App.
   * @param {Object} [properties.configuration] Configuration for App.
   */
  constructor(properties = {}) {
    if (isNil(properties.modules)) {properties.modules = [];}
    if (isNil(properties.configuration)) {
      properties.configuration = {
        appId: null, log: {isEnabled: false}
      };
    }
    super(properties);
    this.initialize(properties.injector || new Injector());
  }

  /**
   * Initializes application.
   * @param  {Injector}  injector Instance of injector set on application.
   */
  initialize(injector) {
    this.app = this;
    this.injector = injector;

    if (!this.hasState(this.STATES.constructed)) {return;} // Only initialize once
    this._state = this.STATES.configuring;

    this._initializeLogger();
    this.log.debug(`${this.constructor.name}: initialize`);

    this._mapTopLevelDependencies();
    this.injector.map('configuration').to(this.configuration);

    this._initializeModules();

    // The app can override all other modules
    deepExtend(this.configuration, this.constructor.prototype.configuration);

    this._runHooks();
  }

  /**
   * Make it possible to override configuration (at any nested level).
   * @param  {Object} options
   */
  configure(options) {
    deepExtend(this.configuration, options);
  }

  /**
   * Initializes logger instance on application.
   */
  _initializeLogger() {
    if (isNil(this.log)) {
      this.log = new Logger();
      this.log.addTransport('console', new ConsoleTransport());
    }
    if (this.getConfig('log.isEnabled', false) && this.log.start) {
      this.log.start();
    }
  }

  /**
   * Setup basic mappings required by all modules.
   */
  _mapTopLevelDependencies() {
    this.injector.map('log').to(this.log);
    this.injector.map('Injector').to(this.injector);
  }

}

export default App;
