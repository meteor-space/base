
class Space.Injector

  @ERRORS:
    cannotMapUndefinedId: -> new Error 'Cannot map undefined value.'
    mappingExists: (id) -> new Error "A mapping for <#{id}> already exists."
    valueNotResolved: (path) -> new Error "Could not resolve <#{path}>."

  constructor: (providers) ->
    @_mappings = {}
    @_providers = providers ? Injector.DEFAULT_PROVIDERS

  toString: -> 'Instance <Space.Injector>'

  map: (id, override) ->
    if not id? then throw Injector.ERRORS.cannotMapUndefinedId()
    mapping = @_mappings[id]
    # Avoid accidential override of existing mapping
    if mapping? and !override
      throw Injector.ERRORS.mappingExists(id)
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
    if not @_mappings[id]? then @autoMap id
    dependency = @_mappings[id].provide(dependentObject)
    @injectInto dependency
    return dependency

  create: (id) -> @get id

  injectInto: (value) ->
    unless _.isObject(value) then return
    # Get flat map of dependencies (possibly inherited)
    dependencies = @_mapDependencies value
    # Inject into dependencies to create the object graph
    value[key] ?= @get(id, value) for key, id of dependencies
    # Notify when dependencies are ready, never call twice
    if value.onDependenciesReady? and !value.__dependenciesInjected__
      value.onDependenciesReady()
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

  addProvider: (name, provider) -> @_providers[name] = provider

  getMappingFor: (id) -> @_mappings[id]

  release: (dependee) ->
    for id, mapping of @_mappings
      mapping.release(dependee) if mapping.hasDependee(dependee)

  _mapDependencies: (value, deps={}) ->
    Class = value.constructor ? null
    SuperClass = Class.__super__ ? null
    # Recurse down the prototype chain
    if SuperClass? then @_mapDependencies SuperClass.constructor::, deps
    # Add dependencies of current value
    deps[key] = id for key, id of value.Dependencies
    return deps

  _resolveValue: (path) ->
    value = Space.resolvePath path
    if not value? then throw Injector.ERRORS.valueNotResolved(path)
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

  provide: (dependee) ->
    # Register depented objects for this mapping so that their
    # dependencies can overwritten later on.
    @_dependents.push(dependee)if dependee? and not @hasDependee(dependee)
    @_provider.provide()

  markForOverride: -> @_overrideInDependents = true

  hasDependee: (dependee) -> @getIndexOfDependee(dependee) > -1

  getIndexOfDependee: (dependee) -> @_dependents.indexOf(dependee)

  release: (dependee) -> @_dependents.splice(@getIndexOfDependee(dependee), 1)

  _setup: (provider) ->
    return (value) => # We are inside an API call like injector.map('this').to('that')
      # Set the provider of this mapping to what the API user chose
      @_provider = new provider @_id, value
      # Override the dependency in all dependent objects if this mapping is flagged
      if @_overrideInDependents
        # Get the value from the provider
        value = @_provider.provide()
        # Loop over the dependees
        for dependee in @_dependents
          # Loop over their Dependencies and override the one this mapping
          # is managing if it exists (it should)
          dependencies = dependee.Dependencies ? {}
          for key, id of dependencies
            if id is @_id
              dependee[key] = value
              dependee.onDependencyChanged?(key, value)

      # Reset the flag to override dependencies
      @_overrideInDependents = false

# ========= DEFAULT PROVIDERS ======== #

class ValueProvider

  constructor: (id, @value) ->
    if not @value?
      @value = if (typeof id is 'string') then Space.resolvePath(id) else id

  toString: -> 'Instance <ValueProvider>'

  provide: -> @value

class InstanceProvider

  constructor: (id, @Class) ->

  toString: -> 'Instance <InstanceProvider>'

  provide: -> new @Class()

class SingletonProvider

  constructor: (id, @Class) ->
    if not @Class? then @Class = id
    if typeof(@Class) is 'string' then @Class = Space.resolvePath(@Class)

  toString: -> 'Instance <SingletonProvider>'

  provide: ->
    if not @_singleton? then @_singleton = new @Class()
    return @_singleton

Space.Injector.DEFAULT_PROVIDERS =

  to: ValueProvider
  toStaticValue: ValueProvider
  asStaticValue: ValueProvider
  toClass: InstanceProvider
  toInstancesOf: InstanceProvider
  asSingleton: SingletonProvider
  toSingleton: SingletonProvider
