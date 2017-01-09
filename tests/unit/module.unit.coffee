import SpaceObject from '../../source/object.coffee';
import Module from '../../source/module.coffee';
import {Injector} from '../../source/injector.coffee';

describe 'Module', ->

  beforeEach ->
    # Reset published space modules
    Module.published = {}

  it 'extends space object', -> expect(Module).to.extend SpaceObject

  describe '@publish', ->

    it 'adds given module to the static collection of published modules', ->
      module = Module.define 'test'
      expect(Module.published['test']).to.equal module

    it 'throws an error if two modules try to publish under same name', ->
      publishTwoModulesWithSameName = ->
        Module.define 'test'
        Module.define 'test'
      expect(publishTwoModulesWithSameName).to.throw Error

  describe '@require', ->

    it 'returns published module for given identifier', ->
      module = Module.define 'test'
      requiredModule = Module.require 'test'
      expect(requiredModule).to.equal module

    it 'throws and error if no module was registered for given identifier', ->
      requireUnkownModule = -> Module.require 'unknown module'
      expect(requireUnkownModule).to.throw Error

  describe 'constructor', ->

    it 'sets required modules to empty array if none defined', ->
      module = new Module()
      expect(module.requiredModules).to.be.instanceof Array
      expect(module.requiredModules).to.be.empty

    it 'leaves the defined required modules intact', ->
      testArray = []
      module = Module.create requiredModules: testArray
      expect(module.requiredModules).to.equal testArray

    it 'sets the correct state', ->
      module = new Module()
      expect(module.is 'constructed').to.be.true


describe 'Module - #initialize', ->

  beforeEach ->
    # Reset published space modules
    Module.published = {}
    @injector = new Injector()
    sinon.spy @injector, 'injectInto'
    @module = new Module()
    # faked required modules to spy on
    @SubModule1 = Module.define 'SubModule1'
    @SubModule2 = Module.define 'SubModule2'
    @app = modules: {}

  it 'asks the injector to inject dependencies into the module', ->
    @module.initialize @app, @injector
    expect(@injector.injectInto).to.have.been.calledWith @module

  it 'throws an error if no injector is provided', ->
    initializeWithoutInjector = => @module.initialize()
    expect(initializeWithoutInjector).to.throw Error

  it 'sets the initialized flag correctly', ->
    @module.initialize @app, @injector
    expect(@module.is 'initialized').to.be.true

  it.server 'adds Npm as property to the module', ->
    @module.initialize @app, @injector
    expect(@module.npm.require).to.be.defined

  it 'invokes the onInitialize method on itself', ->
    @module.onInitialize = sinon.spy()
    @module.initialize @app, @injector
    expect(@module.onInitialize).to.have.been.calledOnce

  it 'creates required modules and adds them to the app', ->
    @module.requiredModules = [@SubModule1.name, @SubModule2.name]
    @module.initialize @app, @injector
    expect(@app.modules[@SubModule1.name]).to.be.instanceof(@SubModule1)
    expect(@app.modules[@SubModule2.name]).to.be.instanceof(@SubModule2)

  it 'initializes required modules', ->
    sinon.stub @SubModule1.prototype, 'initialize'
    @module.requiredModules = [@SubModule1.name]
    @module.initialize @app, @injector
    expect(@SubModule1.prototype.initialize).to.have.been.calledOnce

  it 'can only be initialized once', ->
    @module.onInitialize = sinon.spy()
    @module.initialize @app, @injector
    @module.initialize @app, @injector
    expect(@module.onInitialize).to.have.been.calledOnce

describe 'Module - #start', ->

  beforeEach ->
    @module = new Module()
    @module.log = {debug: sinon.spy()}
    @module.start()
    @module._runLifeCycleAction = sinon.spy()

  it 'sets the state to running', ->
    expect(@module.is 'running').to.be.true

  it 'ignores start calls on a running module', ->
    @module.start()
    expect(@module._runLifeCycleAction).not.to.have.been.called

describe 'Module - #stop', ->

  beforeEach ->
    @module = new Module()
    @module.log = {debug: sinon.spy()}
    @module.start()
    @module.stop()
    @module._runLifeCycleAction = sinon.spy()

  it 'sets the state to stopped', ->
    expect(@module.is 'stopped').to.be.true

  it 'ignores stop calls on a stopped module', ->
    @module.stop()
    expect(@module._runLifeCycleAction).not.to.have.been.called

describe 'Module - #reset', ->

  beforeEach ->
    @module = new Module()
    @module.log = {debug: sinon.spy()}
    @module._runLifeCycleAction = sinon.spy()

  it.server 'rejects attempts to reset when in production', ->
    nodeEnvBackup = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    @module.reset()
    process.env.NODE_ENV = nodeEnvBackup
    expect(@module._runLifeCycleAction).not.to.have.been.called

describe "Module - wrappable lifecycle hooks", ->

  it "allows mixins to hook into the module lifecycle", ->
    moduleOnInitializeSpy = sinon.spy()
    mixinOnInitializeSpy = sinon.spy()
    MyModule = Module.extend {
      onInitialize: moduleOnInitializeSpy
    }
    MyModule.mixin {
      onDependenciesReady: ->
        @_wrapLifecycleHook 'onInitialize', (onInitialize) ->
          onInitialize.call(this)
          mixinOnInitializeSpy.call(this)
    }
    module = new MyModule()
    module.initialize(module, new Injector())

    expect(moduleOnInitializeSpy).to.have.been.calledOnce
    expect(mixinOnInitializeSpy).to.have.been.calledOnce
    expect(moduleOnInitializeSpy).to.have.been.calledBefore(mixinOnInitializeSpy)
