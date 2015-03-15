
class Space.Module extends Space.Object

  injector: null
  RequiredModules: null
  isInitialized: false
  isConfigured: false
  isStarted: false

  @ERRORS:
    injectorMissing: 'Instance of Space.Injector needed to initialize module.'

  constructor: (properties) ->
    super properties
    @RequiredModules ?= []

  initialize: (@app, @injector) ->

    if not injector? then throw new Error Space.Module.ERRORS.injectorMissing

    # Setup required modules
    for moduleId in @RequiredModules

      # Create a new module instance if non exist in the app
      unless app.modules[moduleId]?
        moduleClass = Space.Module.require(moduleId, this.constructor.name)
        app.modules[moduleId] = new moduleClass()

      # Initialize required module
      module = app.modules[moduleId]
      if !module.isInitialized then module.initialize app, injector

    # Give every module access Npm
    if Meteor.isServer then @npm = Npm

    @injector.injectInto this
    @isInitialized = true
    @configure()
    @isConfigured = true

  configure: ->

  start: ->
    for moduleId in @RequiredModules
      module = @app.modules[moduleId]
      unless module.isStarted then module.start()
    if !@isStarted then @run()
    @isStarted = true

  run: ->

  @published = {}

  @publish: (module, identifier) ->

    if Space.Module.published[identifier]?
      throw new Error "Two modules tried to be published as <#{identifier}>"
    else
      Space.Module.published[identifier] = module

  @require: (requiredModule, requestingModule) ->

    module = Space.Module.published[requiredModule]

    if not module?
      throw new Error "Could not find module <#{requiredModule}>
                      required by <#{requestingModule}>"
    else
      return module
