
class Space.Injector

  ERRORS:
    cannotMapUndefinedId: -> new Error 'Cannot map undefined value.'
    mappingExists: (id) -> new Error "A mapping for <#{id}> already exists."
    valueNotResolved: (path) -> new Error "Could not resolve <#{path}>."
    cannotGetValueForUndefined: -> new Error "Cannot get value for undefined."

  constructor: (providers) ->
    @_mappings = {}
    @_providers = providers ? Injector.DEFAULT_PROVIDERS

  toString: -> 'Instance <Space.Injector>'

  map: (id, override) ->
    if not id? then throw @ERRORS.cannotMapUndefinedId()
    mapping = @_mappings[id]
    # Avoid accidential override of existing mapping
    if mapping? and !override
      throw @ERRORS.mappingExists(id)
    else if mapping? and override
      mapping.markForOverride()
      return mapping
    else
      @_mappings[id] = new Mapping id, @_providers
      return @_mappings[id]

  autoMap: (id) ->
    value = @_resolveValue id
    if _.isFunction(value)
      @map(id).toSingleton value
    else
      @map(id).to value

  override: (id) -> @map id, true

  remove: (id) -> delete @_mappings[id]

  get: (id, dependentObject=null) ->
    if !id? then throw @ERRORS.cannotGetValueForUndefined()
    if not @_mappings[id]? then @autoMap id
    dependency = @_mappings[id].provide(dependentObject)
    @injectInto dependency
    return dependency

  create: (id) -> @get id

  injectInto: (value) ->
    unless _.isObject(value) and !value.__dependenciesInjected__ then return
    if Object.defineProperty?
      # Flag this object as injected
      Object.defineProperty value, '__dependenciesInjected__',
        enumerable: false
        configurable: false
        writable: false
        value: true
    else
      # support old engines without Object.defineProperty
      value.__dependenciesInjected__ = true
    # Get flat map of dependencies (possibly inherited)
    dependencies = @_mapDependencies value
    # Inject into dependencies to create the object graph
    value[key] ?= @get(id, value) for key, id of dependencies
    # Notify when dependencies are ready
    if value.onDependenciesReady? then value.onDependenciesReady()

  addProvider: (name, provider) -> @_providers[name] = provider

  getMappingFor: (id) -> @_mappings[id]

  getIdForValue: (value) ->
    for id, mapping of @_mappings
      return id if mapping.getProvider().getValue() is value

  release: (dependent) ->
    for id, mapping of @_mappings
      mapping.release(dependent) if mapping.hasDependent(dependent)

  _mapDependencies: (value, deps={}) ->
    Class = value.constructor ? null
    SuperClass = Class.__super__ ? null
    # Recurse down the prototype chain
    if SuperClass? then @_mapDependencies SuperClass.constructor::, deps
    # Add dependencies of current value
    deps[key] = id for key, id of value.dependencies
    return deps

  _resolveValue: (path) ->
    value = Space.resolvePath path
    if not value? then throw @ERRORS.valueNotResolved(path)
    return value

# ========= PRIVATE CLASSES ========== #

class Mapping

  _id: null
  _provider: null
  _dependents: null
  _overrideInDependents: false

  constructor: (@_id, providers) ->
    @_dependents = []
    @[key] = @_setup(provider) for key, provider of providers

  toString: -> 'Instance <Mapping>'

  provide: (dependent) ->
    # Register depented objects for this mapping so that their
    # dependencies can overwritten later on.
    @_dependents.push(dependent)if dependent? and not @hasDependent(dependent)
    @_provider.provide()

  markForOverride: -> @_overrideInDependents = true

  hasDependent: (dependent) -> @getIndexOfDependee(dependent) > -1

  getIndexOfDependee: (dependent) -> @_dependents.indexOf(dependent)

  release: (dependent) -> @_dependents.splice(@getIndexOfDependee(dependent), 1)

  getId: -> @_id

  getProvider: -> @_provider

  _setup: (provider) ->
    return (value) => # We are inside an API call like injector.map('this').to('that')
      # Set the provider of this mapping to what the API user chose
      @_provider = new provider @_id, value
      # Override the dependency in all dependent objects if this mapping is flagged
      if @_overrideInDependents
        # Get the value from the provider
        value = @_provider.provide()
        # Loop over the dependents
        for dependent in @_dependents
          # Loop over their dependencies and override the one this mapping
          # is managing if it exists (it should)
          dependencies = dependent.dependencies ? {}
          for key, id of dependencies
            if id is @_id
              dependent[key] = value
              dependent.onDependencyChanged?(key, value)

      # Reset the flag to override dependencies
      @_overrideInDependents = false

# ========= DEFAULT PROVIDERS ======== #

class Provider

  _id: null
  _value: null

  constructor: (@_id, @_value) ->

  getValue: -> @_value

class ValueProvider extends Provider

  constructor: ->
    super
    if not @_value?
      if (typeof @_id is 'string')
        @_value = Space.resolvePath(@_id)
      else
        @_value = @_id

  toString: -> 'Instance <ValueProvider>'

  provide: -> @_value

class InstanceProvider extends Provider

  toString: -> 'Instance <InstanceProvider>'

  provide: -> new @_value()

class SingletonProvider extends Provider

  _singleton: null

  constructor: ->
    super
    if not @_value? then @_value = @_id
    if typeof(@_value) is 'string' then @_value = Space.resolvePath(@_value)

  toString: -> 'Instance <SingletonProvider>'

  provide: ->
    if not @_singleton? then @_singleton = new @_value()
    return @_singleton

Space.Injector.DEFAULT_PROVIDERS =

  to: ValueProvider
  toStaticValue: ValueProvider
  asStaticValue: ValueProvider
  toClass: InstanceProvider
  toInstancesOf: InstanceProvider
  asSingleton: SingletonProvider
  toSingleton: SingletonProvider
