
class Space.Injector

  constructor: (providers) ->
    @_mappings = {}
    @_providers = providers ? Injector.DEFAULT_PROVIDERS

  map: (id, override) ->

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

    @_mappings[id].provide()

  create: (id) -> @get id

  injectInto: (value) ->

    # Get flat map of dependencies (possibly inherited)
    dependencies = @_mapDependencies value

    # Inject into dependencies to create the object graph
    for key, id of dependencies
      dependency = @get id
      @injectInto dependency
      value[key] = dependency

    # Notify when dependencies are ready
    value.onDependenciesReady?()

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

  constructor: (@id, providers) ->
    @[key] = @_setup(provider) for key, provider of providers

  provide: -> @_provider.provide()

  _setup: (provider) -> (value) => @_provider = new provider @id, value

# ========= DEFAULT PROVIDERS ======== #

class ValueProvider
  constructor: (@id, @value) ->
  provide: -> @value ? @id

class InstanceProvider
  constructor: (id, @Class) ->
  provide: -> new @Class()

class SingletonProvider
  constructor: (id, @Class) -> if not @Class? then @Class = id
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
