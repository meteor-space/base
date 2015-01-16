
describe 'Space.Application', ->

  it 'extends Space.Module', ->
    expect(new Space.Application()).to.be.instanceof Space.Module

  describe 'construction', ->

    it 'initializes modules map as empty object', ->

      @application = new Space.Application()
      expect(@application.modules).to.eql {}

    it 'creates a new injector instance if none was given', ->

      @application = new Space.Application()
      expect(@application.injector).to.be.instanceof Dependance.Injector

    it 'uses the provided injector when given', ->

      injector = new Dependance.Injector()
      @application = new Space.Application injector: injector
      expect(@application.injector).to.equal injector

    it 'can also be created via static create method', ->

      injector = new Dependance.Injector()
      @application = Space.Application.create injector: injector
      expect(@application.injector).to.equal injector
      expect(Space.Application.create().injector).to.be.instanceof Dependance.Injector

    it 'maps injector instance with itself', ->

      injector = new Dependance.Injector()
      injectionMapping =
        toStaticValue: sinon.spy()
        toClass: sinon.spy()
      injector.map = sinon.stub().returns injectionMapping
      @application = new Space.Application injector: injector

      expect(injector.map).to.have.been.calledWithExactly 'Space.Application.Injector'
      expect(injectionMapping.toStaticValue).to.have.been.calledWithExactly injector

    it 'initializes the application', ->

      initializeSpy = sinon.spy Space.Application.prototype, 'initialize'
      @application = new Space.Application()
      expect(initializeSpy).to.have.been.calledOnce
      initializeSpy.restore()

  describe '#initialize', ->

    it 'calls the super method with configured injector and modules', ->

      superInitialize = sinon.spy Space.Module.prototype, 'initialize'
      application = new Space.Application()
      application.initialize()
      expect(superInitialize).to.have.been.calledWithExactly application.injector, application.modules
      superInitialize.restore()

  describe '#run', ->

    it 'Tells all loaded modules to run.', ->

      requiredModules =
        module1: run: sinon.spy()
        module2: run: sinon.spy()
      application = new Space.Application()
      application.modules = requiredModules
      application.run()
      expect(requiredModules.module1.run).to.have.been.called
      expect(requiredModules.module2.run).to.have.been.called
