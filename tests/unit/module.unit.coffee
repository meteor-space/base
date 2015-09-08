
describe 'Space.Module', ->

  beforeEach ->
    # Reset published space modules
    Space.Module.published = {}

  it 'extends space object', -> expect(Space.Module).to.extend Space.Object

  describe '@publish', ->

    it 'adds given module to the static collection of published modules', ->
      fakeModule = identifier = 'test'
      Space.Module.publish fakeModule, fakeModule.identifier
      expect(Space.Module.published[fakeModule.identifier]).to.equal fakeModule

    it 'throws an error if two modules try to publish under same name', ->
      fakeModule1 = identifier: 'test'
      fakeModule2 = identifier: 'test'
      publishTwoModulesWithSameName = ->
        Space.Module.publish fakeModule1, fakeModule1.identifier
        Space.Module.publish fakeModule2, fakeModule2.identifier
      expect(publishTwoModulesWithSameName).to.throw Error

  describe '@require', ->

    it 'returns published module for given identifier', ->
      fakeModule = identifier = 'test'
      Space.Module.publish fakeModule, fakeModule.identifier
      requiredModule = Space.Module.require fakeModule.identifier
      expect(requiredModule).to.equal fakeModule

    it 'throws and error if no module was registered for given identifier', ->
      requireUnkownModule = -> Space.Module.require 'unknown module'
      expect(requireUnkownModule).to.throw Error

  describe 'constructor', ->

    it 'sets required modules to empty array if none defined', ->
      module = new Space.Module()
      expect(module.RequiredModules).to.be.instanceof Array
      expect(module.RequiredModules).to.be.empty

    it 'leaves the defined required modules intact', ->
      testArray = []
      module = Space.Module.create RequiredModules: testArray
      expect(module.RequiredModules).to.equal testArray

  describe '#run', ->

    it 'defines a no-op run method', ->
      expect(Space.Module::startup).to.be.a('function')


describe 'Space.Module - #initialize', ->

  beforeEach ->
    @app = modules: {}
    @injector = injectInto: sinon.spy()
    @requireStub = sinon.stub Space.Module, 'require'
    @module = new Space.Module()

    # faked required modules to spy on
    @fakeModule1 =
      name: 'module1'
      constructor: sinon.stub()
      initialize: sinon.spy()

    @fakeModule2 =
      name: 'module2'
      constructor: sinon.stub()
      initialize: sinon.spy()

    @fakeModule1.constructor.returns @fakeModule1
    @fakeModule2.constructor.returns @fakeModule2

    # stubbed version of Space.Module.require that returns our fake modules
    @requireStub.withArgs(@fakeModule1.name).returns @fakeModule1.constructor
    @requireStub.withArgs(@fakeModule2.name).returns @fakeModule2.constructor

  afterEach -> @requireStub.restore()

  it 'asks the injector to inject dependencies into the module', ->
    @module.initialize @app, @injector
    expect(@injector.injectInto).to.have.been.calledWith @module

  it 'throws an error if no injector is provided', ->
    initializeWithoutInjector = => @module.initialize()
    expect(initializeWithoutInjector).to.throw Error

  it 'sets the initialized flag correctly', ->
    @module.initialize @app, @injector
    expect(@module.isInitialized).to.be.true

  it.server 'adds Npm as property to the module', ->
    @module.initialize @app, @injector
    expect(@module.npm.require).to.be.defined

  it 'invokes the configure method on itself', ->
    configureSpy = sinon.spy @module, 'configure'
    @module.initialize @app, @injector
    expect(configureSpy).to.have.been.calledOnce

  it 'looks up required modules and adds them to the modules object', ->
    # make our SUT module require our fake modules
    @module.RequiredModules = [@fakeModule1.name, @fakeModule2.name]
    @module.initialize @app, @injector
    expect(@app.modules["#{@fakeModule1.name}"]).to.equal @fakeModule1
    expect(@app.modules["#{@fakeModule2.name}"]).to.equal @fakeModule2

  it 'creates the required modules by calling the constructor with new', ->
    @module.RequiredModules = [@fakeModule1.name, @fakeModule2.name]
    @module.initialize @app, @injector
    expect(@fakeModule1.constructor).to.have.been.calledWithNew
    expect(@fakeModule2.constructor).to.have.been.calledWithNew

  it 'initializes required modules when they are not yet initialized', ->
    @module.RequiredModules = [@fakeModule1.name, @fakeModule2.name]
    @module.initialize @app, @injector
    expect(@fakeModule1.initialize).to.have.been.called
    expect(@fakeModule2.initialize).to.have.been.called

  it 'doesnt initialize required modules if they are already initialized', ->
    @fakeModule1.isInitialized = true
    @fakeModule2.isInitialized = true

    @module.RequiredModules = [@fakeModule1.name, @fakeModule2.name]
    @module.initialize @app, @injector

    expect(@fakeModule1.initialize).not.to.have.been.called
    expect(@fakeModule2.initialize).not.to.have.been.called
