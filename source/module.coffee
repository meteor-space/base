
class Space.Module extends Space.Object

  @ERRORS:
    injectorMissing: 'Instance of Space.Injector needed to initialize module.'

  Configuration: {}
  RequiredModules: null
  # An array of paths to classes that you want to become
  # singletons in your application e.g: ['Space.messaging.EventBus']
  # these are automatically mapped and created on `app.run()`
  Singletons: []

  injector: null
  isInitialized: false
  isConfigured: false
  state: 'stopped'
  # Depreciated: use state instead
  isRunning: false
  isStopped: true
  # --

  constructor: ->
    super
    @RequiredModules ?= []

  initialize: (@app, @injector, mergedConfig={}) ->

    if not @injector? then throw new Error Space.Module.ERRORS.injectorMissing

    # merge any supplied config into this Module's Configuration
    _.deepExtend(@Configuration, mergedConfig)

    # Setup required modules
    for moduleId in @RequiredModules

      # Create a new module instance if not already registered with the app
      unless @app.modules[moduleId]?
        moduleClass = Space.Module.require(moduleId, this.constructor.name)
        @app.modules[moduleId] = new moduleClass()

      # Initialize required module
      module = @app.modules[moduleId]
      module.initialize(@app, @injector, @Configuration) if !module.isInitialized

    @beforeInitialize?()

    # After the required modules have been configured, merge in the own
    # configuration to give the chance for overwriting.
    @Configuration = _.deepExtend(mergedConfig, @constructor::Configuration )

    # Give every module access Npm
    if Meteor.isServer then @npm = Npm

    @injector.injectInto this
    # Map classes that are declared as singletons
    @injector.map(singleton).asSingleton() for singleton in @Singletons
    @onInitialize?()
    @isInitialized = true
    @afterInitialize?()

  start: ->

    if @state is 'running' then return
    @_runLifeCycleAction 'start', => @injector.create(singleton) for singleton in @Singletons
    @state = 'running'

    # Backwards compatibility
    @isStopped = false
    @isRunning = true
    # --

  reset: ->

    restartRequired = true if @state is 'running'
    if restartRequired then @stop()
    @_runLifeCycleAction 'reset'
    if restartRequired then @start()

  stop: ->

    if @state is 'stopped' then return
    @_runLifeCycleAction 'stop', =>
    @state = 'stopped'

    # Backwards compatibility
    @isStopped = true
    @isRunning = false
    # --

  # ========== STATIC MODULE MANAGEMENT ============ #

  @define: (moduleName, prototype) ->
    prototype.toString = -> moduleName # For better debugging
    @publish Space.Module.extend(moduleName, prototype), moduleName

  # All published modules register themselves here
  @published = {}

  # Publishes a module into the space environment to make it
  # visible and requireable for other modules and the application
  @publish: (module, identifier) ->
    module.publishedAs = identifier
    if Space.Module.published[identifier]?
      throw new Error "Two modules tried to be published as <#{identifier}>"
    else
      Space.Module.published[identifier] = module

  # Retrieve a module by identifier
  @require: (requiredModule, requestingModule) ->

    module = Space.Module.published[requiredModule]

    if not module?
      throw new Error "Could not find module <#{requiredModule}>
                      required by <#{requestingModule}>"
    else
      return module

  # Invokes the lifecycle action on all required modules, then on itself,
  # calling the instance hooks before, on, and after
  _runLifeCycleAction: (action, func) ->

    @_invokeActionOnRequiredModules action
    this["before#{@_capitalize(action)}"]?()
    func?()
    this["on#{@_capitalize(action)}"]?()
    this["after#{@_capitalize(action)}"]?()

  _capitalize: (string) ->
    string.charAt(0).toUpperCase() + string.slice(1)

  _invokeActionOnRequiredModules: (action) ->
    @app.modules[moduleId][action]?() for moduleId in @RequiredModules
