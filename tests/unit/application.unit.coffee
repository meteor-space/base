
describe 'Space.Application', ->

  beforeEach ->
    # Reset published space modules
    Space.Module.published = {}

  it 'extends Space.Module', ->
    expect(Space.Application).to.extend Space.Module

  describe 'construction', ->

    it 'initializes modules map as empty object', ->
      expect(new Space.Application().modules).to.eql {}

    it 'creates a new injector instance if none was given', ->
      expect(new Space.Application().injector).to.be.instanceof Space.Injector

    it 'uses the provided injector when given', ->
      injector = new Space.Injector()
      application = new Space.Application injector: injector
      expect(application.injector).to.equal injector

    it 'can also be created via static create method', ->
      injector = new Space.Injector()
      application = Space.Application.create injector: injector
      expect(application.injector).to.equal injector
      expect(Space.Application.create().injector).to.be.instanceof Space.Injector

    it 'maps injector instance with itself', ->
      injector = new Space.Injector()
      injectionMapping =
        to: sinon.spy()
        toInstancesOf: sinon.spy()
      injector.map = sinon.stub().returns injectionMapping
      application = new Space.Application injector: injector

      expect(injector.map).to.have.been.calledWithExactly 'Injector'
      expect(injectionMapping.to).to.have.been.calledWithExactly injector

    it 'initializes the application', ->
      initializeSpy = sinon.spy Space.Application.prototype, 'initialize'
      application = new Space.Application()
      expect(initializeSpy).to.have.been.calledOnce
      initializeSpy.restore()

    it 'merges configurations of all modules and user options', ->
      class FirstModule extends Space.Module
        @publish this, 'FirstModule'
        Configuration: {
          first: {
            toChange: 'first'
            toKeep: 'first'
          }
        }
      class SecondModule extends Space.Module
        @publish this, 'SecondModule'
        RequiredModules: ['FirstModule']
        Configuration: {
          second: {
            toChange: 'second'
            toKeep: 'second'
          }
        }
      class TestApp extends Space.Application
        RequiredModules: ['SecondModule']
        Configuration: {
          toChange: 'app'
          toKeep: 'app'
        }
      app = new TestApp()
      app.configure {
        toChange: 'appPropChanged'
        first: {
          toChange: 'firstChanged'
        }
        second: {
          toChange: 'secondChanged'
        }
      }
      expect(app.injector.get 'Configuration').to.deep.equal {
        toChange: 'appPropChanged'
        toKeep: 'app'
        first: {
          toChange: 'firstChanged'
          toKeep: 'first'
        }
        second: {
          toChange: 'secondChanged'
          toKeep: 'second'
        }
      }
