
Munit.run

  name: 'Space - Application'

  tests: [

    name: 'extends Space.Module'

    func: ->

      application = new Space.Application()
      expect(application).to.be.instanceof Space.Module

  ]

Munit.run

  name: 'Space - Application - constructor'

  tests: [
    {
      name: 'initializes modules map as empty object'

      func: ->

        @application = new Space.Application()
        expect(@application.modules).to.eql {}
    }

    {
      name: 'creates a new injector instance if none was given'

      func: ->

        @application = new Space.Application()
        expect(@application.injector).to.be.instanceof Dependance.Injector
    }

    {
      name: 'uses the provided injector when given'

      func: ->

        injector = new Dependance.Injector()
        @application = new Space.Application injector

        expect(@application.injector).to.equal injector
    }

    {
      name: 'maps injector instance with itself'

      func: ->

        injector = new Dependance.Injector()

        staticValueMappingSpy = sinon.spy()
        injector.map = sinon.stub().returns toStaticValue: staticValueMappingSpy

        @application = new Space.Application injector

        expect(injector.map).to.have.been.calledWithExactly 'Space.Application.Injector'
        expect(staticValueMappingSpy).to.have.been.calledWithExactly injector
    }

    {
      name: 'initializes the application'

      func: ->

        initializeSpy = sinon.spy Space.Application.prototype, 'initialize'

        @application = new Space.Application()
        expect(initializeSpy).to.have.been.calledOnce

        initializeSpy.restore()
    }

  ]

Munit.run

  name: 'Space - Application - #initialize'

  tests: [

    name: 'calls the super method with configured injector and modules'

    func: ->

      superInitialize = sinon.spy Space.Module.prototype, 'initialize'
      application = new Space.Application()

      application.initialize()

      expect(superInitialize).to.have.been.calledWithExactly application.injector, application.modules

      superInitialize.restore()
  ]

Munit.run

  name: 'Space - Application - #run'

  tests: [

    name: 'Tells all loaded modules to run.'

    func: ->

      requiredModules =
        module1: run: sinon.spy()
        module2: run: sinon.spy()

      application = new Space.Application()

      application.modules = requiredModules

      application.run()

      expect(requiredModules.module1.run).to.have.been.called
      expect(requiredModules.module2.run).to.have.been.called
  ]
