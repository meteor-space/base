import {isNil, isObject, isString, assign} from 'lodash';
import {parentClassPrototype} from './helpers.js';
import SpaceError from './error.js';

class InjectionError extends SpaceError {}

class Injector {

  static ERRORS = {
    invalidId: `Provided id can't be <null> or <undefined>`,
    mappingExists(id) {
      return `<${id}> would be overwritten. To override existing
      mapping use <Injector.prototype.override>`;
    },
    mappingNotFound(id) {
      return `No mapping found for <${id}>`;
    },
    invalidInstantiationType: 'Provided instantiation type must be a string',
    providerExists(instantiationType) {
      return `<${instantiationType}> would be overwritten`;
    },
    unexpectedOnProvider(instantiationType) {
      // Splitting it in multiple lines breaks tests.
      return `An unexpected error occured for instantiation type '${instantiationType}' provider`;
    }
  }

  /**
   * Create a Injector.
   * @param  {Object} providers Object with relation instantiationType: provider.
   */
  constructor(providers) {
    this._mappings = {};
    this._providers = providers || assign({}, Injector.DEFAULT_PROVIDERS);
  }

  /**
   * Adds additional provider for instantiation type.
   * @param {String} instantiationType
   * @param {Provider|*} provider
   * @throws {Error} Will throw an error if the instantiationType argument is
   * not a string.
   * @throws {Error} Will throw an error if instantiation type would be
   * overriden.
   */
  addProvider(instantiationType, provider) {
    if (isNil(instantiationType) || !isString(instantiationType)) {
      throw new Error(this.constructor.ERRORS.invalidInstantiationType);
    }
    // Avoid overriding of existing provider do to inconsistent behavior.
    if (!isNil(this._providers[instantiationType])) {
      throw new Error(
        this.constructor.ERRORS.providerExists(instantiationType)
      );
    }
    this._providers[instantiationType] = provider;
  }

  /**
   * Gets provider for instantiation type.
   * @param {String} instantiationType
   * @return {Provider|*|undefined}
   */
  getProvider(instantiationType) {
    return this._providers[instantiationType];
  }

  /**
   * Returns all available providers.
   * @return {Object} Providers with instantiationType: provider relation.
   */
  getProviders() {
    return this._providers;
  }

  /**
   * Creates a mapping on Injector.
   * @param  {String|*}  id Id for which mapping will be created.
   * @param  {Boolean} [shouldOverride=false] Flag indicating that mapping
   * should be overriden if exist.
   * @return {Mapping}
   * @throws {Error} Will throw an error if the id is null or undefined.
   * @throws {Error} Will throw an error if mapping would overridden
   * without explicit call(shouldOverride=true).
   */
  map(id, shouldOverride = false) {
    if (isNil(id)) {
      throw new InjectionError(this.constructor.ERRORS.invalidId);
    }

    const mapping = this._mappings[id];
    // Avoid accidental override of existing mapping
    if (!isNil(mapping) && !shouldOverride) {
      throw new InjectionError(this.constructor.ERRORS.mappingExists(id));
    }

    if (!isNil(mapping) && shouldOverride) {
      mapping.markForOverride();
      return mapping;
    } else {
      this._mappings[id] = new Mapping(id, this._providers);
      return this._mappings[id];
    }
  }

  /**
   * Overrides an existing mapping on Injector.
   * @param  {String} id Id for which mapping will be overriden.
   * @return {Mapping}
   */
  override(id) {
    return this.map(id, true);
  }

  /**
   * Returns dependency mapped on Injector.
   * @param  {String} id Mapping id.
   * @param  {*} [dependentObject=null]
   * @return {*}
   */
  get(id, dependentObject = null) {
    if (isNil(id)) {
      throw new InjectionError(this.constructor.ERRORS.invalidId);
    }
    if (isNil(this._mappings[id])) {
      throw new InjectionError(this.constructor.ERRORS.mappingNotFound(id));
    }
    const dependency = this._mappings[id].provide(dependentObject);
    this.injectInto(dependency);
    return dependency;
  }

  /**
   * Creates dependency.
   * @alias get
   */
  create(id) {
    return this.get(id);
  }

  /**
   * Removes a mapping from Injector.
   * @param  {String} id Id for which mapping will be removed.
   * @return {undefined}
   */
  remove(id) {
    delete this._mappings[id];
  }

  /**
   * Injects dependencies in to dependent.
   * @param  {*} dependent Object or Class or instance of an class that
   * depends on other dependencies.
   * @return {*}       Returns passed dependent with injected dependencies.
   */
  injectInto(dependent) {
    if (!(isObject(dependent) && !dependent.__dependenciesInjected__)) {return;}

    if (!isNil(Object.defineProperty)) {
      // Flag this object as injected
      Object.defineProperty(dependent, '__dependenciesInjected__', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: true
      });
    } else {
      // Support old engines without Object.defineProperty
      dependent.__dependenciesInjected__ = true;
    }

    // Get flat map of dependencies (possibly inherited)
    const dependencies = this._mapDependencies(dependent);
    // Inject into dependencies to create the object graph
    for (let [key, id] of Object.entries(dependencies)) {
      try {
        if (isNil(dependent[key])) {
          dependent[key] = this.get(id, dependent);
        }
      } catch (error) {
        // Spliting it in multiple lines breaks tests.
        error.message += ` for {${key}: '${id}'} in <${dependent}>. Did you forget to map it in your application?`;
        throw error;
      }
    }
    // Notify when dependencies are ready
    if (!isNil(dependent.onDependenciesReady)) {
      dependent.onDependenciesReady();
    }
  }

  /**
   * Returns mapping from Injector.
   * @param  {String} id Id which was used when mapping was created.
   * @return {Mapping}
   */
  getMappingFor(id) {
    return this._mappings[id];
  }

  /**
   * Returns all available mappings.
   * @return {Object} Mappings with id: mapping relation.
   */
  getMappings() {
    return this._mappings;
  }

  /**
   * Returns mapping's id for value on Injector.
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  getIdForValue(value) {
    for (let [id, mapping] of Object.entries(this._mappings)) {
      if (mapping.getProvider().getValue() === value) {
        return id;
      }
    }
    return null;
  }

  /**
   * Release the reference to the dependent
   * @param  {*} dependent Object that depends on other dependencies.
   */
  release(dependent) {
    for (let mapping of Object.values(this._mappings)) {
      if (mapping.hasDependent(dependent)) {
        mapping.release(dependent);
      }
    }
  }

  /**
   * Maps dependencies on dependent
   * @param  {*} dependent Object or Class or instance of an class that
   * depends on other dependencies.
   * @param  {Object} dependencies
   * @return {Object}
   */
  _mapDependencies(dependent, dependencies = {}) {
    const parentClassProto = parentClassPrototype(dependent);
    // Recurse down the prototype chain
    if (!isNil(parentClassProto)) {
      this._mapDependencies(parentClassProto, dependencies);
    }
    if (isNil(dependent.dependencies)) {return dependencies;}
    // Add dependencies of current dependent
    for (let [key, id] of Object.entries(dependent.dependencies)) {
      dependencies[key] = id;
    }
    return dependencies;
  }
}


class Mapping {

  constructor(id, providers = {}) {
    this._id = id;
    this._provider = null;
    this._dependents = [];
    this._overrideInDependents = null;

    for (let [instantiationType, provider] of Object.entries(providers)) {
      this[instantiationType] = this._setup(instantiationType, provider);
    }
  }

  /**
   * Converts Mapping to string.
   * @return {String}
   */
  toString() {
    return 'Instance <Mapping>';
  }

  /**
   * Register depended for this mapping so that their
   * dependencies can overwritten later on.
   * @param  {Object} dependent Object or Class or instance of an class.
   * @return {*}           [description]
   */
  provide(dependent) {
    if (!isNil(dependent) && !this.hasDependent(dependent)) {
      this._dependents.push(dependent);
    }
    return this._provider.provide();
  }

  /**
   * Marks that mapping should be overriden on all dependents.
   */
  markForOverride() {
    this._overrideInDependents = true;
  }

  /**
   * Evaluates that mapping has provided dependent.
   * @param  {*}  dependent
   * @return {Boolean}
   */
  hasDependent(dependent) {
    return this.getIndexOfDependee(dependent) > -1;
  }

  /**
   * Returns current index of dependent on dependents array.
   * @param  {*} dependent
   * @return {Number}
   */
  getIndexOfDependee(dependent) {
    return this._dependents.indexOf(dependent);
  }

  /**
   * Releases dependent from mapping.
   * @param  {*} dependent
   */
  release(dependent) {
    this._dependents.splice(this.getIndexOfDependee(dependent), 1);
  }

  /**
   * Returns mapping id.
   * @return {String}
   */
  getId() {
    return this._id;
  }

  getProvider() {
    return this._provider;
  }

  _setup(instantiationType, ProviderClass) {
    return ((value) => {
      // Inside API call:
      // injector.map('this').to('that')
      // Set the provider of this mapping to what the API user chose
      try {
        this._provider = new ProviderClass(this._id, value);
      } catch (error) {
        error.message += '. ' + Injector.ERRORS.unexpectedOnProvider(instantiationType);
        throw error;
      }
      // Override the dependency in all dependent objects if this mapping is flagged
      if (this._overrideInDependents) {
        // Get the value from the provider
        const providersValue = this._provider.provide();
        // Loop over the dependents
        for (let dependent of Object.values(this._dependents)) {
          // Loop over their dependencies and override the one this mapping
          // is managing if it exists (it should)
          const dependencies = dependent.dependencies || {};
          for (let [key, id] of Object.entries(dependencies)) {
            if (id === this._id) {
              dependent[key] = providersValue;
              if (!isNil(dependent.onDependencyChanged)) {
                dependent.onDependencyChanged(key, value);
              }
            }
          }
        }
      }
      // Reset the flag to override dependencies
      this._overrideInDependents = false;
    });
  }
}


class Provider {
  constructor(id = null, value = null) {
    this._id = id;
    this._value = value;
  }

  /**
   * Returns provider value.
   * @return {*}
   */
  getValue() {
    return this._value;
  }
}

class ValueProvider extends Provider {
  constructor(id, value) {
    super(id, value);
    if (isNil(this._value)) {
      this._value = this._id;
    }
  }

  toString() {
    return 'Instance <ValueProvider>';
  }

  /**
   * Returns provider value as it was set.
   * @return {*}
   */
  provide() {
    return this._value;
  }
}

class InstanceProvider extends Provider {

  toString() {
    return 'Instance <InstanceProvider>';
  }

  /**
   * Returns provider value as new instance.
   * @return {*}
   */
  provide() {
    return new this._value();
  }
}

class SingletonProvider extends Provider {
  constructor(id, value) {
    super(id, value);
    this.singleton = null;
    if (isNil(this._value)) {
      this._value = this._id;
    }
  }

  toString() {
    return 'Instance <SingletonProvider>';
  }

  /**
   * Returns singleton version of instance of class.
   * @return {*}
   */
  provide() {
    if (isNil(this._singleton)) {
      this._singleton = new this._value();
    }
    return this._singleton;
  }
}

Injector.DEFAULT_PROVIDERS = {
  to: ValueProvider,
  toStaticValue: ValueProvider,
  asStaticValue: ValueProvider,
  toClass: InstanceProvider,
  toInstancesOf: InstanceProvider,
  asSingleton: SingletonProvider,
  toSingleton: SingletonProvider
};

export {
  InjectionError,
  Injector,
  Provider,
  ValueProvider,
  InstanceProvider,
  SingletonProvider
};
