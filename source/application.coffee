
class Space.Application extends Space.Module

  modules: null

  constructor: (@injector) ->
    super()

    @modules = {}

    @injector ?= new Dependance.Injector()
    @injector.map('Space.Application.Injector').toStaticValue @injector

    @initialize()

  initialize: -> super(@injector, @modules)

  run: -> @modules[module].run() for module of @modules
