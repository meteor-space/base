
class Space.Injector

  constructor: -> [@mappings, @providers] = [{}, {}]

  map: (id, override) ->

    # Avoid accidential override of existing mapping
    if @mappings[id]? and !override
      throw new Error "A mapping for <#{id}> already exists."

    @mappings[id] = new Mapping id, @providers

  override: (id) -> @map id, true

  remove: (id) -> delete @mappings[id]

  get: (id) ->

    # Provide nice error message if a mapping wasn't found
    if not @mappings[id]?
      throw new Error "No mapping for identifier <#{id}> was found."

    @mappings[id].provide()

  injectInto: (value) ->

    # Get flat map of dependencies (possibly inherited)
    dependencies = @_mapDependencies value

    # Inject into dependencies to create the object graph
    for key, id of dependencies
      dependency = @get id
      @injectInto dependency
      value[key] = dependency

  addProvider: (name, provider) -> @providers[name] = provider

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
