import Logger from './logger.js';
import {capitalize, isNil, get, set, isFunction} from 'lodash';
require('./lib/underscore-deep-extend-mixin.js');

class Module {

  static ERRORS = {
    injectorMissing: 'Instance of Injector is required to initialize module',
    invalidModule(value) {
      return `Provided value '${value}' is not an instance of Module or
      class inheriting from Module`;
    }
  };

  configuration = {
    logging: {isEnabled: false}
  };
  modules = [];
  // An array of paths to classes that you want to become
  // singletons in your application e.g: ['EventBus']
  // these are automatically mapped and created on `app.run()`
  singletons = [];
  injector = null;
  _state = 'constructed';

  /**
   * Create a Module.
   * @param  {Object} properties Additional or overriding properties for Module.
   * @param {Object} [properties.configuration] Configuration for Module.
   */
  constructor(properties = {}) {
    for (let [key, value] of Object.entries(properties)) {
      this[key] = value;
    }
  }

  /**
   * Initializes module.
   * @param  {App}  app Application that requires module.
   * @param  {Injector}  injector Instance of injector set on application.
   * @param  {Boolean} [isSubModule=false] Indicates that initialization is done
   * for submodule.
   */
  initialize(app, injector, isSubModule = false) {
    if (isNil(injector)) {
      throw new Error(this.constructor.ERRORS.injectorMissing);
    }
    this.app = app;
    this.injector = injector;

    if (!this.is('constructed')) {return;} // Only initialize once
    this._state = 'configuring';

    this._initializeLogger(isSubModule);
    this.log.debug(`${this.constructor.name}: initialize`);

    if (!isSubModule) {
      this._mapTopLevelModuleDependencies();
    }
    this._initializeModules();
    this._mergeConfigurationWithApp(app, isSubModule);

    this._runBeforeInitializeHooks();

    if (!isSubModule) {return;}
    // Top-level module
    this.injector.map('configuration').to(this.configuration);
    this._runOnInitializeHooks();
    this._autoMapSingletons();
    this._autoCreateSingletons();
    this._runAfterInitializeHooks();
  }

  /**
   * Changes module state to 'running' and invokes lifecycle 'start' action.
   */
  start() {
    if (this.is('running')) {return;}
    this._runLifeCycleAction('start');
    this._state = 'running';
  }

  /**
   * Restarts module state and invokes all associated lifecycle hooks.
   */
  reset() {
    // Don't allow reseting on production env
    if (this._isServer() && this._isProduction()) {return;}
    if (this._isResetting) {return;}

    const restartRequired = this.is('running');
    this._isResetting = true;
    if (restartRequired) {this.stop();}
    this._runLifeCycleAction('reset');
    if (restartRequired) {this.start();}
  }

  /**
   * Changes module state to 'stopped' and invokes lifecycle 'stop' action.
   */
  stop() {
    if (this.is('stopped')) {return;}
    this._runLifeCycleAction('stop', () => {});
    this._state = 'stopped';
  }

  /**
   * Evaluates if module is in state.
   * @param  {String}  expectedState One of available states.
   * @return {Boolean}
   */
  is(expectedState) {
    return expectedState === this._state;
  }

  /**
   * Gets specific nested configuration.
   * @param  {String} path Path to nested configuration with dot notation.
   * @return {*|null}
   * @example
   * new Module().getConfig('foo');
   * new Module().getConfig('foo.bar');
   * new Module().getConfig('foo.bar.baz');
   */
  getConfig(path) {
    return get(this.configuration, path);
  }

  /**
   * Sets specific nested configuration.
   * @param  {String} path Path to nested configuration with dot notation.
   * @param  {*} value Any allowed value by configuration.
   * @example
   * new Module().setConfig('foo', 'value');
   * new Module().setConfig('foo.bar', 'value');
   * new Module().setConfig('foo.bar.baz', 'value');
   */
  setConfig(path, value) {
    return set(this.configuration, path, value);
  }
  /**
   * Initializes logger instance no module.
   * @param {Object} config - Configuration for logger.
   * @param  {Boolean} isSubModule Indicates that initialization is done
   * for submodule.
   */
  _initializeLogger(isSubModule) {
    if (!isSubModule) {
      const loggingConfig = this.getConfig('logging');
      this.log = new Logger(loggingConfig);
      if (loggingConfig.isEnabled) {this.log.start();}
    } else {
      this.log = this.injector.get('log');
    }
  }

  /**
   * Setup basic mappings required by all modules.
   */
  _mapTopLevelModuleDependencies() {
    this.injector.map('log').to(this.log);
    this.injector.map('Injector').to(this.injector);
  }

  /**
   * Initializes all required modules.
   */
  _initializeModules() {
    for (let module of this.modules) {
      module.initialize(this.app, this.injector, isSubModule = true);
    }
  }

  _mergeConfigurationWithApp(app, isSubModule) {
    // Merge in own configuration to give the chance for overwriting.
    if (isSubModule) {
      _.deepExtend(this.app.configuration, this.configuration);
      this.configuration = this.app.configuration;
    } else {
      // The app can override all other modules
      _.deepExtend(this.configuration, this.constructor.prototype.configuration);
    }
  }

  /**
   * Provide lifecycle hook before any initialization has been done.
   */
  _runBeforeInitializeHooks() {
    if (!isFunction(this.beforeInitialize)) {return;}
    this.beforeInitialize();
  }

  /**
   * Invokes the lifecycle action on all required modules, then on itself,
   * calling the instance hooks before, on, and after.
   * @param  {String} action Action name.
   * @param  {Function} func  Function that will run between 'before' and 'on'
   * hooks.
   */
  _runLifeCycleAction(action, fn) {
    this._invokeActionOnModules(action);
    this.log.debug(`${this.constructor.publishedAs}: ${action}`);

    if (isFunction(this[`before${capitalize(action)}`])) {
      this[`before${capitalize(action)}`]();
    }
    if (isFunction(fn)) {fn();}
    if (isFunction(this[`on${capitalize(action)}`])) {
      this[`on${capitalize(action)}`]();
    }
    if (isFunction(this[`after${capitalize(action)}`])) {
      this[`after${capitalize(action)}`]();
    }
  }

  /**
   * Provide lifecycle hook after this module was configured and injected
   */
  _runOnInitializeHooks() {
    this._invokeActionOnModules('_runOnInitializeHooks');
    // Never run this hook twice
    if (this.is('configuring')) {
      this.log.debug(`${this.constructor.publishedAs}: onInitialize`);
      this._state = 'initializing';
      // Inject required dependencies into this module
      this.injector.injectInto(this);
      // Call custom lifecycle hook if existant
      if (isFunction(this.onInitialize)) {
        this.onInitialize();
      }
    }
  }

  _autoMapSingletons() {
    this._invokeActionOnModules('_autoMapSingletons');
    if (this.is('initializing')) {
      this.log.debug(`${this.constructor.publishedAs}: _autoMapSingletons`);
      this._state = 'auto-mapping-singletons';
      // Map classes that are declared as singletons
      for (let singleton of this.singletons) {
        this.injector.map(singleton).asSingleton();
      }
    }
  }

  _autoCreateSingletons() {
    this._invokeActionOnModules('_autoCreateSingletons');
    if (this.is('auto-mapping-singletons')) {
      this.log.debug(`${this.constructor.publishedAs}: _autoCreateSingletons`);
      this._state = 'auto-creating-singletons';
      // Create singleton classes
      for (let singleton of this.singletons) {
        this.injector.create(singleton);
      }
    }
  }

  /**
   * Invoke last hook After all modules in the tree have been configured.
   */
  _runAfterInitializeHooks() {
    this._invokeActionOnModules('_runAfterInitializeHooks');
    // Never run this hook twice
    if (this.is('auto-creating-singletons')) {
      this.log.debug(`${this.constructor.publishedAs}: afterInitialize`);
      this._state = 'initialized';
      // Call custom lifecycle hook if existant
      if (isFunction(this.afterInitialize)) {
        this.afterInitialize();
      }
    }
  }

  _invokeActionOnModules(action) {
    for (let moduleId of this.requiredModules) {
      if (isFunction(this.app.modules[moduleId][action])) {
        this.app.modules[moduleId][action]();
      }
    }
  }

  _wrapLifecycleHook(hook, wrapper) {
    if (isNil(this[hook])) {
      this[hook] = () => {};
    }
    this[hook] = _.wrap(this[hook], wrapper);
  }


  _isServer() {
    return !(typeof window !== 'undefined' && window.document);
  }

  _isProduction() {
    return process.env.NODE_ENV === 'production';
  }
}

export default Module;
