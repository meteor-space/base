
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
  isRunning: false
  isReset: false
  isStopped: false

  constructor: ->
    super
    @RequiredModules ?= []

  initialize: (@app, @injector, mergedConfig={}) ->

    if not @injector? then throw new Error Space.Module.ERRORS.injectorMissing

    # Setup required modules
    for moduleId in @RequiredModules

      # Create a new module instance if non exist in the app
      unless @app.modules[moduleId]?
        moduleClass = Space.Module.require(moduleId, this.constructor.name)
        @app.modules[moduleId] = new moduleClass()

      # Initialize required module
      module = @app.modules[moduleId]
      module.initialize(@app, @injector, mergedConfig) if !module.isInitialized
    @beforeInitialize?()
    # After the required modules have been configured, merge in the own
    # configuration to give the chance for overwriting.
    _.deepExtend(mergedConfig, @constructor::Configuration)
    @Configuration = mergedConfig

    # Give every module access Npm
    if Meteor.isServer then @npm = Npm

    @injector.injectInto this
    # Map classes that are declared as singletons
    @injector.map(singleton).asSingleton() for singleton in @Singletons
    @onInitialize?()
    @isInitialized = true
    @afterInitialize?()

  start: -> @_runLifeCycleHook 'start', 'isRunning', =>
    # Create the singleton instances that are declared
    @injector.create(singleton) for singleton in @Singletons

  reset: -> @_runLifeCycleHook 'reset', 'isReset'

  stop: -> @_runLifeCycleHook 'stop', 'isStopped'

  # ========== STATIC MODULE MANAGAMENT ============ #

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

  # Retrieve a module by indentifier
  @require: (requiredModule, requestingModule) ->

    module = Space.Module.published[requiredModule]

    if not module?
      throw new Error "Could not find module <#{requiredModule}>
                      required by <#{requestingModule}>"
    else
      return module

  # Invokes the given lifecycle hook on all required modules and then on itself
  _runLifeCycleHook: (hookName, hookRan, hookAction) ->
    # Don't invoke hooks when the given boolean (e.g: isRunning) is true!
    if this[hookRan] then return
    # Capitalize the first char of the hook name
    capitalizedHook = hookName.charAt(0).toUpperCase() + hookName.slice(1)
    # Run the main hook on all required modules
    @_invokeMethodOnRequiredModules hookName
    # Give the chance to act before the action is invoked
    this["before#{capitalizedHook}"]?()
    # Run the hook action that was provided for this hook
    hookAction?()
    # Give the chance to act
    this["on#{capitalizedHook}"]?()
    this[hookRan] = true
    this["after#{capitalizedHook}"]?()

  _invokeMethodOnRequiredModules: (method) ->
    @app.modules[moduleId][method]?() for moduleId in @RequiredModules
