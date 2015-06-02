
class Space.Injector

  constructor: (providers) ->
    @_mappings = {}
    @_providers = providers ? Injector.DEFAULT_PROVIDERS

  map: (id, override) ->
    if not id? then throw new Error 'Cannot map undefined value.'
    # Avoid accidential override of existing mapping
    if @_mappings[id]? and !override
      throw new Error "A mapping for <#{id}> already exists."
    @_mappings[id] = new Mapping id, @_providers

  override: (id) -> @map id, true

  remove: (id) -> delete @_mappings[id]

  get: (id) ->
    # Provide nice error message if a mapping wasn't found
    if not @_mappings[id]?
      throw new Error "No mapping for identifier <#{id}> was found."
    dependency = @_mappings[id].provide()
    @injectInto dependency
    return dependency

  create: (id) -> @get id

  injectInto: (value) ->
    unless _.isObject(value) then return
    # Get flat map of dependencies (possibly inherited)
    dependencies = @_mapDependencies value
    # Inject into dependencies to create the object graph
    value[key] ?= @get(id) for key, id of dependencies
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

  _mapDependencies: (value, deps={}) ->
    Class = value.constructor ? null
    SuperClass = Class.__super__ ? null
    # Recurse down the prototype chain
    if SuperClass? then @_mapDependencies SuperClass.constructor::, deps
    # Add dependencies of current value
    deps[key] = id for key, id of value.Dependencies
    return deps

# ========= PRIVATE CLASSES ========== #

class Mapping

  constructor: (@_id, providers) ->
    @[key] = @_setup(provider) for key, provider of providers

  provide: -> @_provider.provide()

  _setup: (provider) -> (value) => @_provider = new provider @_id, value

# ========= DEFAULT PROVIDERS ======== #

class ValueProvider
  constructor: (id, @value) ->
    if not @value?
      @value = if (typeof id is 'string') then Space.resolvePath(id) else id

  provide: -> @value

class InstanceProvider
  constructor: (id, @Class) ->
  provide: -> new @Class()

class SingletonProvider
  constructor: (id, @Class) ->
    if not @Class? then @Class = id
    if typeof(@Class) is 'string' then @Class = Space.resolvePath(@Class)

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
