import App from '../../src/app.js';
import Module from '../../src/module.js';
import {Injector} from '../../src/injector.js';
import Logger from '../../src/logger.js';
import ConsoleTransport from '../../src/logging-transports/console-transport.js';
import LoggingTransport from '../../src/logging-transports/logging-transport.js';
import chai, {expect} from 'chai';
import sinon from 'sinon';
const {spaceChai} = require('space-testing');
chai.use(spaceChai);

describe('App', function() {

  it('extends Module', () => {
    expect(App).to.extend(Module);
  });

  describe('construction', () => {
    it('initializes modules on application as empty array', () => {
      const app = new App();
      expect(app.modules).to.be.instanceof(Array);
      expect(app.modules).to.be.empty;
    });

    it('takes an object with modules property as array and assigns it', () => {
      const testArray = [new App()];
      const app = new App({modules: testArray});
      expect(app.modules).to.eql(testArray);
    });

    it('initializes configuration as object with logging and appId property', () => {
      const app = new App();
      expect(app.configuration).to.be.instanceof(Object);
      expect(app.configuration).to.be.sameAs({
        appId: null,
        log: {isEnabled: false}
      });
    });

    it(`takes an object with configuration property and assings it`, () => {
      const properties = {configuration: {'baz': 'lorem'}};
      expect(new App(properties).configuration).to.be.sameAs(
        properties.configuration
      );
    });

    it(`throws invalid module error if provided modules does not inherit from Module`, () => {
      const invalidModule = 'my-module';
      expect(() => {
        new App({modules: [invalidModule]});
      }).to.throw(
        App.ERRORS.invalidModule(JSON.stringify(invalidModule, null, 2))
      );
    });
  });

  describe(`initialization`, () => {
    it('initializes the application', () => {
      const initializeSpy = sinon.spy(App.prototype, 'initialize');
      const app = new App();
      expect(initializeSpy).to.have.been.calledOnce;
      initializeSpy.restore();
    });

    it('creates a new injector instance if none was given on construction', () => {
      expect(new App().injector).to.be.instanceof(Injector);
    });

    it('uses the provided injector when given', () => {
      const injector = new Injector();
      const app = new App({injector: injector});
      expect(app.injector).to.equal(injector);
    });

    it('maps injector instance with itself', () => {
      const injector = new Injector();
      const injectionMapping = {
        to: sinon.spy(),
        toInstancesOf: sinon.spy()
      };
      injector.map = sinon.stub().returns(injectionMapping);
      const app = new App({injector: injector});

      expect(injector.map).to.have.been.calledWithExactly('Injector');
      expect(injectionMapping.to).to.have.been.calledWithExactly(injector);
    });

    it('can be only initialized once', () => {
      const injector = new Injector();
      const app = new App({injector: injector});
      // First initialization
      // Initialize app once so it changes state from constructed to
      // initialized
      expect(app.hasState('initialized')).to.be.true;

      const log = {debug: sinon.spy()};
      injector.override('log').to(log);
      // Second initialization of already initialized app
      // Use other injector to verify that initialization stops before
      // even initializing logger
      app.initialize(injector);
      expect(log.debug).to.be.calledNever;
    });

    describe(`injector mapping`, () => {
      it(`maps top level dependencies on injector`, () => {
        const app = new App();
        expect(app.injector.get('log')).to.be.equal(app.log);
        expect(app.injector.get('Injector')).to.be.equal(app.injector);
      });

      it(`maps configuration to injector`, () => {
        const configuration = {foo: 'bar'};
        const app = new App({configuration: configuration});
        expect(app.injector.get('configuration')).to.be.eql(configuration);
      });
    });

    describe(`logger`, () => {
      it(`initializes logger as instance of Logger`, () => {
        const app = new App();
        expect(app.log).to.be.instanceof(Logger);
      });

      it(`ensures that logger has console logger added`, () => {
        const app = new App();
        expect(app.log).to.be.instanceof(Logger);
        expect(app.log.hasTransport('console')).to.be.true;
        expect(app.log.getTransport('console')).to.be.instanceof(ConsoleTransport);
      });

      it(`initializes logger and logs initialization stage before initializing
      submodules`, () => {
        const log = {debug: sinon.spy()};
        const module = sinon.createStubInstance(Module);
        const app = new App({modules: [module], log: log});

        expect(app.log.debug).to.be.calledWithExactly(`App: initialize`);
        expect(app.log.debug).to.be.calledBefore(module.initialize);
      });

      it(`starts logging if logging is enabled on application configuration`, () => {
        const logger = new Logger();
        const loggingLib = {debug: sinon.spy()};
        logger.addTransport('fake', new LoggingTransport(loggingLib));

        const app = new App({
          configuration: {log: {isEnabled: true}}, log: logger
        });
        expect(app.log.hasState('running')).to.be.true;
        expect(loggingLib.debug).to.be.called;
      });
    });

    it('initializes modules of application', () => {
      const module1 = sinon.createStubInstance(Module);
      const module2 = sinon.createStubInstance(Module);

      const app = new App({modules: [module1, module2]});
      expect(module1.initialize).to.been.calledOnce;
      expect(module1.initialize).to.been.calledWithExactly(
        app, app.injector
      );
      expect(module2.initialize).to.been.calledOnce;
      expect(module2.initialize).to.been.calledWithExactly(
        app, app.injector
      );
    });

    it('sets the initialized flag correctly on last stage', () => {
      const app = new App();
      expect(app.hasState('initialized')).to.be.true;
    });

    it(`runs initalizing hooks`, () => {
      class MyApp extends App {}
      MyApp.prototype.beforeInitialize = sinon.spy();
      MyApp.prototype.onInitialize = sinon.spy();
      MyApp.prototype.afterInitialize = sinon.spy();

      const app = new MyApp();
      expect(app.beforeInitialize).to.be.calledOnce;
      expect(app.onInitialize).to.be.calledOnce;
      expect(app.afterInitialize).to.be.calledOnce;
    });
  });

  describe(`mutation`, () => {
    it('merges configurations of all modules', () => {
      class GrandchildModule extends Module {
        constructor() {
          super({
            configuration: {
              subModuleValue: 'grandChild',
              grandchild: {
                toChange: 'grandchildChangeMe',
                toKeep: 'grandchildKeepMe'
              }
            }
          });
        }
      }

      class ChildModule extends Module {
        constructor() {
          super({
            modules: [new GrandchildModule()],
            configuration: {
              subModuleValue: 'child',
              child: {
                toChange: 'childChangeMe',
                toKeep: 'childKeepMe'
              }
            }
          });
        }
      }

      class TestApp extends App {
        constructor() {
          super({
            modules: [new ChildModule()],
            configuration: {
              toChange: 'appChangeMe',
              subModuleValue: 'overriddenByApp'
            }
          });
        }
      }

      const app = new TestApp();
      app.configure({
        toChange: 'appNewValue',
        child: {
          toChange: 'childNewValue'
        },
        grandchild: {
          toChange: 'grandchildNewValue'
        }
      });

      expect(app.injector.get('configuration')).to.be.sameAs({
        toChange: 'appNewValue',
        subModuleValue: 'overriddenByApp',
        child: {
          toChange: 'childNewValue',
          toKeep: 'childKeepMe'
        },
        grandchild: {
          toChange: 'grandchildNewValue',
          toKeep: 'grandchildKeepMe'
        }
      });
    });
  });

});
