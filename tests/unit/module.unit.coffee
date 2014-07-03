
Munit.run

  name: 'Space - Module - @publish'

  tearDown: ->
    # reset published space modules
    Space.Module.published = {}

  tests: [
    {
      name: 'adds given module to the static collection of published modules'

      func: ->

        fakeModule = identifier = 'test'

        Space.Module.publish fakeModule, fakeModule.identifier

        expect(Space.Module.published[fakeModule.identifier]).to.equal fakeModule
    }

    {
      name: 'throws an error if two modules try to publish under same name'

      func: ->

        fakeModule1 = identifier: 'test'
        fakeModule2 = identifier: 'test'

        publishTwoModulesWithSameName = ->
          Space.Module.publish fakeModule1, fakeModule1.identifier
          Space.Module.publish fakeModule2, fakeModule2.identifier

        expect(publishTwoModulesWithSameName).to.throw Error
    }


  ]

Munit.run

  name: 'Space - Module - @require'

  tearDown: ->
    # reset published space modules
    Space.Module.published = {}

  tests: [
    {
      name: 'returns published module for given identifier'

      func: ->

        # SETUP
        fakeModule = identifier = 'test'
        Space.Module.publish fakeModule, fakeModule.identifier

        # ACTION
        requiredModule = Space.Module.require fakeModule.identifier

        # VERIFY
        expect(requiredModule).to.equal fakeModule
    }

    {
      name: 'throws and error if no module was registered for given identifier'

      func: ->

        # ACTION
        requireUnkownModule = -> Space.Module.require 'unknown module'

        # VERIFY
        expect(requireUnkownModule).to.throw Error
    }


  ]


Munit.run

  name: 'Space - Module - constructor'

  tests: [
    {
      name: 'sets required modules to empty array if none defined'

      func: ->

        module = new Space.Module()

        expect(module.RequiredModules).to.be.instanceof Array
        expect(module.RequiredModules).to.be.empty
    }

    {
      name: 'leaves the defined required modules intact'

      func: ->

        testArray = []

        class TestModule extends Space.Module
          RequiredModules: testArray

        module = new TestModule()

        expect(module.RequiredModules).to.equal testArray
    }


  ]

Munit.run

  name: 'Space - Module - #initialize'

  setup: ->
    @injector = injectInto: sinon.spy()
    @requireStub = sinon.stub Space.Module, 'require'
    @module = new Space.Module()

    # faked required modules to spy on
    @fakeModule1 = name: 'module1', constructor: sinon.stub(), initialize: sinon.spy()
    @fakeModule2 = name: 'module2', constructor: sinon.stub(), initialize: sinon.spy()

    @fakeModule1.constructor.returns @fakeModule1
    @fakeModule2.constructor.returns @fakeModule2

    # stubbed version of Space.Module.require that returns our fake modules
    @requireStub.withArgs(@fakeModule1.name).returns @fakeModule1.constructor
    @requireStub.withArgs(@fakeModule2.name).returns @fakeModule2.constructor

  tearDown: ->
    @requireStub.restore()

  tests: [

    {
      name: 'asks the injector to inject dependencies into the module'

      func: ->
        @module.initialize @injector
        expect(@injector.injectInto).to.have.been.calledWith @module
    }

    {
      name: 'throws an error if no injector is provided'

      func: ->
        initializeWithoutInjector = => @module.initialize()
        expect(initializeWithoutInjector).to.throw Error
    }

    {
      name: 'sets the initialized flag correctly'

      func: ->
        @module.initialize @injector
        expect(@module.isInitialized).to.be.true
    }

    {
      name: 'adds Npm as property to the module'

      func: ->
        if Meteor.isServer
          @module.initialize @injector
          expect(@module.npm.require).to.be.defined
    }

    {
      name: 'invokes the configure method on itself'

      func: ->
        configureSpy = sinon.spy @module, 'configure'

        @module.initialize @injector

        expect(configureSpy).to.have.been.calledOnce
    }

    {
      name: 'looks up required modules and adds them to the modules object'

      func: ->
        # make our SUT module require our fake modules
        @module.RequiredModules = [@fakeModule1.name, @fakeModule2.name]

        # ACTION
        modules = {}
        @module.initialize @injector, modules

        # VERIFY
        expect(modules["#{@fakeModule1.name}"]).to.equal @fakeModule1
        expect(modules["#{@fakeModule2.name}"]).to.equal @fakeModule2
    }

    {
      name: 'creates the required modules by calling the constructor with new'

      func: ->
        @module.RequiredModules = [@fakeModule1.name, @fakeModule2.name]

        # ACTION
        @module.initialize @injector, {}

        # VERIFY
        expect(@fakeModule1.constructor).to.have.been.calledWithNew
        expect(@fakeModule2.constructor).to.have.been.calledWithNew
    }

    {
      name: 'initializes required modules when they are not yet initialized'

      func: ->
        @module.RequiredModules = [@fakeModule1.name, @fakeModule2.name]

        # ACTION
        @module.initialize @injector, {}

        # VERIFY
        expect(@fakeModule1.initialize).to.have.been.called
        expect(@fakeModule2.initialize).to.have.been.called
    }

    {
      name: 'does not initialize required modules if they are already initialized'

      func: ->
        @fakeModule1.isInitialized = true
        @fakeModule2.isInitialized = true

        @module.RequiredModules = [@fakeModule1.name, @fakeModule2.name]

        # ACTION
        @module.initialize @injector, {}

        # VERIFY
        expect(@fakeModule1.initialize).not.to.have.been.called
        expect(@fakeModule2.initialize).not.to.have.been.called
    }


  ]

Munit.run

  name: 'Space - Module - #run'

  tests: [
    {
      name: 'defines a no-op run method'

      func: -> expect(Space.Module::run).to.be.a('function')
    }

  ]
