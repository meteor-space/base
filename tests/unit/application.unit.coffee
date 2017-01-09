import Application from '../../source/application.coffee';
import Module from '../../source/module.coffee';
import {Injector} from '../../source/injector.coffee';

describe 'Application', ->

  beforeEach ->
    # Reset published space modules
    Module.published = {}

  it 'extends Module', ->
    expect(Application).to.extend Module

  describe 'construction', ->

    it 'initializes modules map as empty object', ->
      expect(new Application().modules).to.eql {}

    it 'creates a new injector instance if none was given', ->
      expect(new Application().injector).to.be.instanceof Injector

    it 'uses the provided injector when given', ->
      injector = new Injector()
      application = new Application injector: injector
      expect(application.injector).to.equal injector

    it 'can also be created via static create method', ->
      injector = new Injector()
      application = Application.create injector: injector
      expect(application.injector).to.equal injector
      expect(Application.create().injector).to.be.instanceof Injector

    it 'maps injector instance with itself', ->
      injector = new Injector()
      injectionMapping =
        to: sinon.spy()
        toInstancesOf: sinon.spy()
      injector.map = sinon.stub().returns injectionMapping
      application = new Application injector: injector

      expect(injector.map).to.have.been.calledWithExactly 'Injector'
      expect(injectionMapping.to).to.have.been.calledWithExactly injector

    it 'initializes the application', ->
      initializeSpy = sinon.spy Application.prototype, 'initialize'
      application = new Application()
      expect(initializeSpy).to.have.been.calledOnce
      initializeSpy.restore()

    it 'can be passed a configuration', ->

      @application = new Application({
        configuration: {
          environment: 'testing'
        }
      })
      expect(@application.configuration.environment).to.equal('testing')

    it 'merges configurations of all modules and user options', ->
      class GrandchildModule extends Module
        @publish this, 'GrandchildModule'
        configuration: {
          subModuleValue: 'grandChild'
          grandchild: {
            toChange: 'grandchildChangeMe'
            toKeep: 'grandchildKeepMe'
          }
        }

      class ChildModule extends Module
        @publish this, 'ChildModule'
        requiredModules: ['GrandchildModule']
        configuration: {
          subModuleValue: 'child'
          child: {
            toChange: 'childChangeMe'
            toKeep: 'childKeepMe'
          }
        }
      class TestApp extends Application
        requiredModules: ['ChildModule']
        configuration: {
          toChange: 'appChangeMe'
          subModuleValue: 'overriddenByApp'
        }
      app = new TestApp()
      app.configure {
        toChange: 'appNewValue'
        child: {
          toChange: 'childNewValue'
        }
        grandchild: {
          toChange: 'grandchildNewValue'
        }
      }
      expect(app.injector.get 'configuration').toMatch {
        toChange: 'appNewValue'
        subModuleValue: 'overriddenByApp'
        child: {
          toChange: 'childNewValue'
          toKeep: 'childKeepMe'
        }
        grandchild: {
          toChange: 'grandchildNewValue'
          toKeep: 'grandchildKeepMe'
        }
      }
