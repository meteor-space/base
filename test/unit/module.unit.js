import Module from '../../src/module.js';
import {Injector} from '../../src/injector.js';
import {expect} from 'chai';
import sinon from 'sinon';

describe('Module', function() {
  const sb = sinon.sandbox.create();

  before(() => {
    this.current = {
      NODE_ENV: process.env.NODE_ENV
    };
  });

  beforeEach(() => {
    this.log = {
      debug: sb.spy()
    };
    this.injector = new Injector();
    // Dependency 'log' is required by each module.
    this.injector.map('log').to(this.log);
    sb.spy(this.injector, 'injectInto');
    this.app = {modules: {}, configuration: {foo: 'bar'}};
  });

  describe('construction', () => {
    it('initializes modules as empty array', () => {
      const module = new Module();
      expect(module.modules).to.be.instanceof(Array);
      expect(module.modules).to.be.empty;
    });

    it('takes an object with module property as array and assigns it', () => {
      const testArray = [new Module()];
      const module = new Module({modules: testArray});
      expect(module.modules).to.eql(testArray);
    });

    it('initializes configuration object with logging property', () => {
      const module = new Module();
      expect(module.configuration).to.be.instanceof(Object);
      expect(module.configuration).to.be.eql({log: {isEnabled: false}});
    });

    it('sets the correct state on construction', () => {
      const module = new Module();
      expect(module.hasState('constructed')).to.be.true;
    });

    it(`takes an object with configuration property and assings it`, () => {
      const properties = {configuration: {'baz': 'lorem'}};
      expect(new Module(properties).configuration).to.be.eql(
        properties.configuration
      );
    });

    it(`throws invalid module error if provided submodule does not inherit from Module`, () => {
      const invalidModule = 'my-module';
      expect(() => {
        new Module({modules: [invalidModule]});
      }).to.throw(
        Module.ERRORS.invalidModule(JSON.stringify(invalidModule, null, 2))
      );
    });
  });

  describe('initialization', () => {
    it('throws an error if no application is provided', () => {
      expect(() => {
        new Module().initialize();
      }).to.throw(Module.ERRORS.appMissing);
    });

    it('throws an error if no injector is provided', () => {
      expect(() => {
        new Module().initialize(this.app);
      }).to.throw(Module.ERRORS.injectorMissing);
    });

    it('can be only initialized once', () => {
      const module = new Module();
      // First initialization
      // Initialize module once so it changes state from constructed to
      // initialized
      module.initialize(this.app, this.injector);
      expect(module.hasState('initialized')).to.be.true;

      const log = {debug: sinon.spy()};
      module.injector.override('log').to(log);
      // Second initialization of already initialized module
      // Use other injector to verify that initialization stops before
      // even initializing logger
      module.initialize(this.app, module.injector);
      expect(log.debug).to.be.calledNever;
    });

    it(`initializes logger and logs initialization stage before initializing
    submodules`, () => {
      const submodule = sinon.createStubInstance(Module);
      const module = new Module({modules: [submodule]});

      module.initialize(this.app, this.injector);
      expect(module.log).to.be.equal(this.log);
      expect(this.log.debug).to.be.calledWithExactly(`Module: initialize`);
      expect(this.log.debug).to.be.calledBefore(submodule.initialize);
    });

    describe(`submodules`, () => {
      it('initializes submodules of module', () => {
        const submodule1 = sinon.createStubInstance(Module);
        const submodule2 = sinon.createStubInstance(Module);

        const module = new Module({modules: [submodule1, submodule2]});
        module.initialize(this.app, this.injector);
        expect(submodule1.initialize).to.been.calledOnce;
        expect(submodule1.initialize).to.been.calledWithExactly(
          this.app, this.injector
        );
        expect(submodule2.initialize).to.been.calledOnce;
        expect(submodule2.initialize).to.been.calledWithExactly(
          this.app, this.injector
        );
      });

      it(`invokes action on sub modules`, () => {
        const submodule1 = sinon.createStubInstance(Module);
        const submodule2 = sinon.createStubInstance(Module);

        const module = new Module({modules: [submodule1, submodule2]});
        module.initialize(this.app, this.injector);
        module.stop();
        expect(submodule1.stop).to.been.calledOnce;
        expect(submodule2.stop).to.been.calledOnce;
      });
    });

    it(`merges module configuration with application configuration`, () => {
      const module = new Module({configuration: {lorem: 'ipsum'}});
      module.initialize(this.app, this.injector);

      const expectedConfiguration = {
        foo: 'bar', lorem: 'ipsum'
      };
      expect(this.app.configuration).to.be.eql(expectedConfiguration);
      expect(module.configuration).to.be.eql(expectedConfiguration);
    });

    it(`ensures that module configuration is only merging on non existing
    properties`, () => {
      const app = {modules: [], configuration: {foo: 'baz'}};
      const module = new Module({configuration: {foo: 'bar', lorem: 'ipsum'}});
      module.initialize(app, this.injector);

      const expectedConfiguration = {
        foo: 'baz', lorem: 'ipsum'
      };
      expect(app.configuration).to.be.eql(expectedConfiguration);
      expect(module.configuration).to.be.eql(expectedConfiguration);
    });

    it('invokes the beforeInitialize method on itself', () => {
      const module = new Module();
      module.beforeInitialize = sinon.spy();
      module.initialize(this.app, this.injector);
      expect(module.beforeInitialize).to.have.been.calledOnce;
    });

    it('invokes the onInitialize method on itself', () => {
      const module = new Module();
      module.onInitialize = sinon.spy();
      module.initialize(this.app, this.injector);
      expect(module.onInitialize).to.have.been.calledOnce;
    });

    it('invokes the afterInitialize method on itself', () => {
      const module = new Module();
      module.afterInitialize = sinon.spy();
      module.initialize(this.app, this.injector);
      expect(module.afterInitialize).to.have.been.calledOnce;
    });

    it('injects dependencies into the module at initialization stage', () => {
      const module = new Module();
      module.initialize(this.app, this.injector);
      expect(this.injector.injectInto).to.have.been.calledWith(module);
    });

    it('sets the initialized flag correctly on last stage', () => {
      const module = new Module();
      module.initialize(this.app, this.injector);
      expect(module.hasState('initialized')).to.be.true;
    });
  });

  describe('starting', () => {
    class MyModule extends Module {}
    beforeEach(() => {
      MyModule.prototype.beforeStart = sb.spy();
      MyModule.prototype.onStart = sb.spy();
      MyModule.prototype.afterStart = sb.spy();
    });

    it('throws invalid state error when starting not initialized module', () => {
      const module = new Module();
      expect(() => {module.start();}).to.throw(Module.ERRORS.invalidState(
        'constructed', ['initialized', 'stopped', 'running'].join(', '))
      );
    });

    it('sets the state to running', () => {
      const module = new Module();
      module.initialize(this.app, this.injector);
      module.start();
      expect(module.hasState('running')).to.be.true;
    });

    it('ignores start calls on a running module', () => {
      const module = new MyModule();
      module.initialize(this.app, this.injector);
      module.start();
      module.start(); // Start module second time

      expect(MyModule.prototype.beforeStart).to.be.not.calledTwice;
      expect(MyModule.prototype.onStart).to.be.not.calledTwice;
      expect(MyModule.prototype.afterStart).to.be.not.calledTwice;
    });

    it(`runs start lifecycle hooks`, () => {
      const module = new MyModule();
      module.initialize(this.app, this.injector);
      module.start();
      expect(MyModule.prototype.beforeStart).to.be.calledOnce;
      expect(MyModule.prototype.onStart).to.be.calledOnce;
      expect(MyModule.prototype.afterStart).to.be.calledOnce;
    });
  });

  describe('stopping', () => {
    class MyModule extends Module {}
    beforeEach(() => {
      MyModule.prototype.beforeStop = sb.spy();
      MyModule.prototype.onStop = sb.spy();
      MyModule.prototype.afterStop = sb.spy();
    });

    it('throws invalid state error when stopping not initialized module', () => {
      const module = new Module();
      expect(() => {module.stop();}).to.throw(Module.ERRORS.invalidState(
        'constructed', ['initialized', 'stopped', 'running'].join(', '))
      );
    });

    it('sets the state to stopped', () => {
      const module = new Module();
      module.initialize(this.app, this.injector);
      module.stop();
      expect(module.hasState('stopped')).to.be.true;
    });

    it('ignores stop calls on a stopped module', () => {
      const module = new MyModule();
      module.initialize(this.app, this.injector);
      module.stop();
      module.stop(); // Stop module second time

      expect(MyModule.prototype.beforeStop).to.be.not.calledTwice;
      expect(MyModule.prototype.onStop).to.be.not.calledTwice;
      expect(MyModule.prototype.afterStop).to.be.not.calledTwice;
    });

    it(`runs stop lifecycle hooks`, () => {
      const module = new MyModule();
      module.initialize(this.app, this.injector);
      module.stop();
      expect(MyModule.prototype.beforeStop).to.be.calledOnce;
      expect(MyModule.prototype.onStop).to.be.calledOnce;
      expect(MyModule.prototype.afterStop).to.be.calledOnce;
    });
  });

  describe('reseting', () => {
    class MyModule extends Module {}
    beforeEach(() => {
      MyModule.prototype.beforeReset = sb.spy();
      MyModule.prototype.onReset = sb.spy();
      MyModule.prototype.afterReset = sb.spy();
    });

    it('throws invalid state error when reseting not initialized module', () => {
      const module = new Module();
      expect(() => {module.reset();}).to.throw(Module.ERRORS.invalidState(
        'constructed', ['initialized', 'stopped', 'running'].join(', '))
      );
    });

    describe(`environment`, () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'test';
      });

      afterEach(() => {
        process.env.NODE_ENV = this.current.NODE_ENV;
      });

      it('throws invalid environment error when reseting in production environment', () => {
        process.env.NODE_ENV = 'production';

        const module = new Module();
        module.initialize(this.app, this.injector);
        expect(() => {module.reset();}).to.throw(
          Module.ERRORS.invalidEnvironment('reset', 'production')
        );
      });
    });

    it('ignores reset calls on a stopped module', () => {
      const module = new MyModule();
      module.initialize(this.app, this.injector);
      module.reset();
      module.reset(); // Stop module second time

      expect(MyModule.prototype.beforeReset).to.be.not.calledTwice;
      expect(MyModule.prototype.onReset).to.be.not.calledTwice;
      expect(MyModule.prototype.afterReset).to.be.not.calledTwice;
    });

    it(`runs reset lifecycle hooks`, () => {
      const module = new MyModule();
      module.initialize(this.app, this.injector);
      module.reset();
      expect(MyModule.prototype.beforeReset).to.be.calledOnce;
      expect(MyModule.prototype.onReset).to.be.calledOnce;
      expect(MyModule.prototype.afterReset).to.be.calledOnce;
    });

    it(`restarts already running module to running state`, () => {
      const stop = sb.spy(MyModule.prototype, 'stop');
      const module = new MyModule();
      module.initialize(this.app, this.injector);
      module.start();

      const start = sb.spy(MyModule.prototype, 'start');
      module.reset();
      expect(start).to.be.calledOnce;
      expect(stop).to.be.calledOnce;
    });
  });

  describe(`evaluation`, () => {
    describe(`environment`, () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'test';
      });

      afterEach(() => {
        process.env.NODE_ENV = this.current.NODE_ENV;
      });

      it(`returns true if environment is set to production`, () => {
        expect(Module.prototype.isProduction()).to.be.equal.false;
      });

      it(`returns false if environment is not set to production`, () => {
        const currentNodeENV = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        expect(Module.prototype.isProduction()).to.be.equal.true;

        process.env.NODE_ENV = currentNodeENV;
      });
    });
  });

  describe(`accesors`, () => {
    describe(`configuration`, () => {
      it(`returns configuration value from application configuration`, () => {
        const module = new Module();
        module.initialize(this.app, this.injector);
        expect(module.getConfig('foo')).to.be.equal('bar');
      });

      it(`returns undefined when configuration can't be found on application
      configuration`, () => {
        const module = new Module();
        module.initialize(this.app, this.injector);
        expect(module.getConfig('baz')).to.be.equal(undefined);
      });

      it(`returns module's configuration value if present when module
      is not yet initialized`, () => {
        const module = new Module({configuration: {foo: 'baz'}});
        expect(module.getConfig('foo')).to.be.equal('baz');
      });

      it(`allows to pass optionally second argument with default value`, () => {
        const defaultValue = 'my-default-value';
        const module = new Module({configuration: {foo: 'baz'}});
        expect(module.getConfig('foo')).to.be.equal('baz');
        expect(
          module.getConfig('foo.baz.bar', defaultValue)
        ).to.be.equal(defaultValue);
      });
    });
  });

  describe(`mutators`, () => {
    describe(`configuration`, () => {
      it(`sets configuration on application`, () => {
        const module = new Module();
        module.initialize(this.app, this.injector);
        module.setConfig('lorem', 'ipsum');
        expect(module.getConfig('lorem')).to.be.equal('ipsum');
      });

      it(`sets nested configuration on non existing property on application`, () => {
        const module = new Module();
        module.initialize(this.app, this.injector);
        module.setConfig('lorem.foobar', 'ipsum');
        expect(module.getConfig('lorem.foobar')).to.be.equal('ipsum');
      });

      it(`sets configuration on module if module is not yet initialized`, () => {
        const module = new Module();
        module.setConfig('lorem', 'ipsum');
        expect(module.getConfig('lorem')).to.be.equal('ipsum');
      });
    });
  });
});
