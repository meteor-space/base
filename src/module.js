import {capitalize, isNil, get, set, isFunction, includes} from 'lodash';
import deepExtend from 'deep-extend';

class Module {

  static ERRORS = {
    appMissing: 'Instance of App is required to initialize module',
    injectorMissing: 'Instance of Injector is required to initialize module',
    invalidModule(value) {
      return `Provided value '${value}' is not an instance of Module`;
    },
    invalidState(currentState, expectedStates) {
      return `Expected module with current state of '${currentState}' to be in
      '${expectedStates}'`;
    },
    invalidEnvironment(action, currentEnv) {
      return `Trying to run action '${action}' on '${currentEnv}' environment`;
    }
  };

  STATES = {
    constructed: `constructed`,
    configuring: `configuring`,
    initializing: `initializing`,
    initialized: `initialized`,
    running: `running`,
    stopped: `stopped`
  }

  /**
   * Create a Module.
   * @param  {Object} properties Additional or overriding properties for Module.
   * @param {Object} [properties.configuration] Configuration for Module.
   */
  constructor(properties = {}) {
    // On time writing this package there is issue with Babel and class
    // properties on inheriting classes
    // TODO: move this to class property when its fixed
    if (isNil(properties.modules)) {properties.modules = [];}
    if (isNil(properties.configuration)) {
      properties.configuration = {
        log: {isEnabled: false}
      };
    }

    for (let [key, value] of Object.entries(properties)) {
      this[key] = value;
    }

    this.injector = null;
    this._state = this.STATES.constructed;
    this._validateModules();
  }

  /**
   * Initializes module.
   * @param  {App}  app Application that requires module.
   * @param  {Injector}  injector Instance of injector set on application.
   * for submodule.
   * @throws {Error} Will throw an error if the app argument is missing
   * @throws {Error} Will throw an error if the injector argument is missing.
   */
  initialize(app, injector) {
    if (isNil(app)) {
      throw new Error(this.constructor.ERRORS.appMissing);
    }
    if (isNil(injector)) {
      throw new Error(this.constructor.ERRORS.injectorMissing);
    }
    this.app = app;
    this.injector = injector;

    if (!this.hasState(this.STATES.constructed)) {return;} // Only initialize once
    this._state = this.STATES.configuring;

    this._initializeLogger();
    this.log.debug(`${this.constructor.name}: initialize`);

    this._initializeModules();
    this._mergeConfigurationWithApp(this.app);

    this._runHooks();
  }

  /**
   * Changes module state to 'running' and invokes lifecycle 'start' action.
   * @throws {Error} Will throw an error if the module is not in correct state.
   */
  start() {
    this._validateState([
      this.STATES.initialized, this.STATES.stopped, this.STATES.running
    ]);

    if (this.hasState(this.STATES.running)) {return;}
    this._runLifeCycleAction('start');
    this._state = this.STATES.running;
  }

  /**
   * Changes module state to 'stopped' and invokes lifecycle 'stop' action.
   * @throws {Error} Will throw an error if the module is not in correct state.
   */
  stop() {
    this._validateState([
      this.STATES.initialized, this.STATES.stopped, this.STATES.running
    ]);

    if (this.hasState(this.STATES.stopped)) {return;}
    this._runLifeCycleAction('stop', () => {});
    this._state = this.STATES.stopped;
  }

  /**
   * Restarts module state and invokes all associated lifecycle hooks.
   * @throws {Error} Will throw an error if the module is not in correct state.
   */
  reset() {
    this._validateState([
      this.STATES.initialized, this.STATES.stopped, this.STATES.running
    ]);

    if (!this._isAllowedToResetOnProduction()) {
      throw new Error(
        this.constructor.ERRORS.invalidEnvironment('reset', process.env.NODE_ENV)
      );
    }
    if (this._isResetting) {return;}

    const restartRequired = this.hasState(this.STATES.running);
    this._isResetting = true;
    if (restartRequired) {this.stop();}
    this._runLifeCycleAction('reset');
    if (restartRequired) {this.start();}
  }

  /**
   * Evaluates if module is in state.
   * @param  {String}  expectedState One of available states.
   * @return {Boolean}
   */
  hasState(expectedState) {
    return expectedState === this._state;
  }

  /**
   * Gets specific nested configuration.
   * @param  {String} path Path to nested configuration with dot notation.
   * @return {*|undefined}
   * @example
   * new Module().getConfig('foo');
   * new Module().getConfig('foo.bar');
   * new Module().getConfig('foo.bar.baz');
   */
  getConfig(path, defaultValue) {
    let configuration = isNil(this.app) ?
      this.configuration : this.app.configuration;

    return get(configuration, path) || defaultValue;
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
    let configuration = isNil(this.app) ?
      this.configuration : this.app.configuration;

    return set(configuration, path, value);
  }

  /**
   * Evaluates if current environment is in production.
   * @return {Boolean}
   */
  isProduction() {
    return this.isOnEnviroment('production');
  }

  /**
   * Evaluates if current environment matches provided one.
   * @param  {String}  env
   * @return {Boolean}
   */
  isOnEnviroment(env) {
    return process.env.NODE_ENV === env;
  }

  /**
   * Validates if module is in allowed states.
   * @param  {String[]} expectedStates Allowed states list
   * @throws {Error} Will throw an error if the module is not in correct state.
   */
  _validateState(allowedStates) {
    if (!includes(allowedStates, this._state)) {
      throw new Error(
        this.constructor.ERRORS.invalidState(this._state, allowedStates.join(', '))
      );
    }
  }
  /**
   * Validates set modules.
   * @throws {Error} Will throw an error if one of set modules on Module
   * is not inhering from Module.
   */
  _validateModules() {
    for (let module of this.modules) {
      if (!(module instanceof Module)) {
        const strinified = JSON.stringify(module, null, 2);
        throw new Error(this.constructor.ERRORS.invalidModule(strinified));
      }
    }
  }

  /**
   * Initializes logger instance no module.
   */
  _initializeLogger() {
    this.log = this.injector.get('log');
  }

  /**
   * Initializes all required modules.
   */
  _initializeModules() {
    for (let module of this.modules) {
      module.initialize(this.app, this.injector);
    }
  }

  /**
   * Runs through 'beforeInitialize', 'onInitialize', 'afterInitialize' hooks.
   */
  _runHooks() {
    this._runBeforeInitializeHooks();
    this._runOnInitializeHooks();
    this._runAfterInitializeHooks();
  }
  /**
   * Merge in own configuration to give the chance for overwriting.
   * @param  {App} app
   */
  _mergeConfigurationWithApp(app) {
    const defaults = deepExtend(this.configuration, app.configuration);
    deepExtend(app.configuration, defaults);
    this.configuration = app.configuration;
  }

  /**
   * Provide lifecycle hook before any initialization has been done.
   */
  _runBeforeInitializeHooks() {
    if (isFunction(this.beforeInitialize)) {
      this.beforeInitialize();
    }
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
    this.log.debug(`${this.constructor.name}: ${action}`);

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
    if (this.hasState(this.STATES.configuring)) {
      this.log.debug(`${this.constructor.name}: onInitialize`);
      this._state = this.STATES.initializing;
      // Inject required dependencies into this module
      this.injector.injectInto(this);
      // Call custom lifecycle hook if existant
      if (isFunction(this.onInitialize)) {
        this.onInitialize();
      }
    }
  }

  /**
   * Invoke last hook After all modules in the tree have been configured.
   */
  _runAfterInitializeHooks() {
    this._invokeActionOnModules('_runAfterInitializeHooks');
    // Never run this hook twice
    if (this.hasState(this.STATES.initializing)) {
      this.log.debug(`${this.constructor.name}: afterInitialize`);
      this._state = this.STATES.initialized;
      // Call custom lifecycle hook if existant
      if (isFunction(this.afterInitialize)) {
        this.afterInitialize();
      }
    }
  }

  /**
   * Runs lifecycle on each set modules on Module.
   * @param  {String} action
   */
  _invokeActionOnModules(action) {
    for (let module of this.modules) {
      if (isFunction(module[action])) {
        module[action]();
      }
    }
  }

  /**
   * Futureproofing any more robust evaluation.
   * @return {Boolean}
   */
  _isAllowedToResetOnProduction() {
    return !this.isProduction();
  }

}

export default Module;
