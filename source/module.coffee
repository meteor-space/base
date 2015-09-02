
class Space.Module extends Space.Object

  @ERRORS:
    injectorMissing: 'Instance of Space.Injector needed to initialize module.'

  injector: null
  RequiredModules: null
  isInitialized: false
  isConfigured: false
  isStarted: false

  # An array of paths to classes that you want to become
  # singletons in your application e.g: ['Space.messaging.EventBus']
  # these are automatically mapped and created on `app.run()`
  Singletons: []

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
    # Map classes that are declared as singletons
    @injector.map(singleton).asSingleton() for singleton in @Singletons
    @isInitialized = true
    @configure()
    @isConfigured = true

  start: ->
    # Start all required modules first if necessary
    for moduleId in @RequiredModules
      module = @app.modules[moduleId]
      unless module.isStarted then module.start()

    if !@isStarted
      # Create the singleton instances that are declared
      @injector.create(singleton) for singleton in @Singletons
      # Let the user do other stuff on module startup
      @startup()

    @isStarted = true

  # Override to configure your mappings etc. after the
  # module was initialized but the application is not running yet.
  configure: ->

  # Override for final initialization when the application runs
  startup: ->

  # ========== STATIC MODULE MANAGAMENT ============ #

  @define: (moduleName, prototype) ->
    prototype.toString = -> moduleName # For better debugging
    @publish Space.Module.extend(moduleName, prototype), moduleName

  # All published modules register themselves here
  @published = {}

  # Publishes a module into the space environment to make it
  # visible and requireable for other modules and the application
  @publish: (module, identifier) ->

    if Space.Module.published[identifier]?
      throw new Error "Two modules tried to be published as <#{identifier}>"
    else
      Space.Module.published[identifier] = module

  # Retrieve a module by indentifier
  @require: (requiredModule, requestingModule) ->

    module = Space.Module.published[requiredModule]

    if not module?
      throw new Error "Could not find module <#{requiredModule}>
                      required by <#{requestingModule}>"
    else
      return module
