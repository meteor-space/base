
class Space.Application extends Space.Module

  modules: null

  constructor: (@injector) ->
    super()

    @modules = {}
    @injector ?= new Dependance.Injector()

    @initialize()

  initialize: -> super(@injector, @modules)
