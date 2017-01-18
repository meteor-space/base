import {
  Injector, ValueProvider, InstanceProvider, SingletonProvider
} from '../../src/injector.js';
import dependencies from '../../src/decorators/dependencies-decorator.js';
import {expect} from 'chai';
import sinon from 'sinon';

describe('Injector', function() {

  beforeEach(() => {
    this.injector = new Injector();
  });

  describe(`construction`, () => {
    it('initializes mappings as empty object', () => {
      const injector = new Injector();
      expect(injector.getMappings()).to.be.instanceof(Object);
      expect(injector.getMappings()).to.be.empty;
    });

    it(`initializes default providers if none are passed on construction`, () => {
      expect(new Injector().getProviders()).to.be.eql(Injector.DEFAULT_PROVIDERS);
    });

    it(`takes providers as an object with instantiationType: provider relation`, () => {
      const providers = {my: sinon.spy()};
      const injector = new Injector(providers);
      expect(injector.getProviders()).to.be.eql(providers);
    });
  });

  describe(`providers`, () => {
    const loremIpsum = 'lorem ipsum';
    class LoremIpsumProvider {
      provide() {
        return loremIpsum;
      }
    }

    it(`returns all availabe providers as an object with relation of
    instantiationType: provider`, () => {
      this.injector.addProvider('toLoremIpsum', LoremIpsumProvider);

      const expectedProviders = {
        toLoremIpsum: LoremIpsumProvider,
        to: ValueProvider,
        toStaticValue: ValueProvider,
        asStaticValue: ValueProvider,
        toClass: InstanceProvider,
        toInstancesOf: InstanceProvider,
        asSingleton: SingletonProvider,
        toSingleton: SingletonProvider
      };
      expect(this.injector.getProviders()).to.be.eql(expectedProviders);
    });

    it('adds customer provider', () => {
      this.injector.addProvider('toLoremIpsum', LoremIpsumProvider);
      this.injector.map('test').toLoremIpsum();
      expect(this.injector.get('test')).to.equal(loremIpsum);
    });

    it(`throws invalid instantiation type  when instantiation type is not passed`, () => {
      expect(() => {this.injector.addProvider(LoremIpsumProvider);}).to.throw(
        Injector.ERRORS.invalidInstantiationType
      );
    });

    it('throws error if provider would be overriden', () => {
      const instantiationType = 'toLoremIpsum';
      this.injector.addProvider(instantiationType, LoremIpsumProvider);
      expect(() => {
        this.injector.addProvider(instantiationType, LoremIpsumProvider);
      }).to.throw(
        Injector.ERRORS.providerExists(instantiationType)
      );
    });

    it(`returns provider by injectionType`, () => {
      expect(this.injector.getProvider('to')).to.be.equal(ValueProvider);
      expect(this.injector.getProvider('toStaticValue')).to.be.equal(ValueProvider);
      expect(this.injector.getProvider('asStaticValue')).to.be.equal(ValueProvider);
      expect(this.injector.getProvider('toClass')).to.be.equal(InstanceProvider);
      expect(this.injector.getProvider('toInstancesOf')).to.be.equal(InstanceProvider);
      expect(this.injector.getProvider('asSingleton')).to.be.equal(SingletonProvider);
      expect(this.injector.getProvider('toSingleton')).to.be.equal(SingletonProvider);
    });

    it(`returns null if instantiation type is not provided`, () => {
      expect(this.injector.getProvider('my-instantiation-type')).to.be.equal(null);
    });
  });

  describe('mappings', () => {
    it(`throws invalid id error if passed id on mapping is undefined or null`, () => {
      expect(() => {
        this.injector.map(undefined);
      }).to.throw(Injector.ERRORS.invalidId);
      expect(() => {
        this.injector.map(null);
      }).to.throw(Injector.ERRORS.invalidId);
    });

    it('throws mapping exists error if mapping would be overriden', () => {
      const id = 'foo';
      this.injector.map(id).to('bar');
      expect(() => {
        this.injector.map(id).to('other');
      }).to.throw(Injector.ERRORS.mappingExists(id));
    });

    it('injects into requested dependency', () => {
      const myDependant = {
        dependencies: {'nameForDependency': 'dependencyId'}
      };
      const testValue = {};
      this.injector.map('dependencyId').to(testValue);
      this.injector.map('myDependant').to(myDependant);

      expect(
        this.injector.get('myDependant').nameForDependency
      ).to.equal(testValue);
    });

    it('uses the toString method if id is not a string', () => {
      class TestClass  {
        static toString() {return 'TestClass';}
      }

      this.injector.map(TestClass).asSingleton();
      expect(this.injector.get('TestClass')).to.be.instanceof(TestClass);
    });

    it(`throws mapping if provided id is undefined or null`, () => {
      expect(()=> this.injector.get(undefined)).to.throw(
        Injector.ERRORS.invalidId
      );
      expect(()=> this.injector.get(null)).to.throw(
        Injector.ERRORS.invalidId
      );
    });

    it(`throws mapping not found error if mapping doesn't exist`, () => {
      const id = 'foo';
      expect(()=> this.injector.get(id)).to.throw(
        Injector.ERRORS.mappingNotFound(id)
      );
    });

    it('can remove existing mappings', () => {
      const id = 'foo';
      this.injector.map(id).to('bar');
      this.injector.remove(id);
      expect(()=> {this.injector.get(id);}).to.throw(
        Injector.ERRORS.mappingNotFound(id)
      );
    });

    it('provides an alias for getting values', () => {
      this.injector.map('foo').to('bar');
      expect(this.injector.create('foo')).to.equal('bar');
    });

    it(`returns id from mapped value`, () => {
      const value = 'my-value';
      this.injector.map('test').to(value);
      expect(this.injector.getIdForValue(value)).to.be.equal('test');
    });

    it(`returns null from not existing value mapping`, () => {
      const value = 'my-non-existing-value';
      expect(this.injector.getIdForValue(value)).to.be.equal(null);
    });

    describe(`conversion`, () => {
      it(`converts mapping to a string`, () => {
        expect(
          this.injector.map('test').toString()
        ).to.be.equal('Instance <Mapping>');
      });
    });

    it(`returns mapping id`, () => {
      const id = 'my-id';
      expect(this.injector.map(id).getId()).to.be.equal(id);
    });

    it(`throws error if providers were set innaproprietly`, () => {
      const injector = new Injector({toInvalid: {}});
      expect(() => {
        injector.map('test').toInvalid('test');
      }).to.throw(
        `ProviderClass is not a constructor. An unexpected error occured for instantiation type 'toInvalid' provider`
      );
    });

    describe('overriding mappings', () => {
      it('allows to override mappings', () => {
        const id = 'foo';
        this.injector.map(id).to('test');
        this.injector.override(id).to('other');
        expect(this.injector.get(id)).to.equal('other');
      });

      it('dynamically updates all dependent objects with the new dependency', () => {
        const myDependant = {
          dependencies: {'nameForDependency': 'dependencyId'}
        };

        const firstValue = {first: true};
        const secondValue = {second: true};
        this.injector.map('dependencyId').to(firstValue);

        this.injector.injectInto(myDependant);
        expect(myDependant.nameForDependency).to.equal(firstValue);

        this.injector.override('dependencyId').to(secondValue);
        expect(myDependant.nameForDependency).to.equal(secondValue);
      });

      it('allows to de-register a dependent object from the mappings', () => {
        const myDependant = {
          dependencies: {
            first: 'First',
            second: 'Second'
          }
        };
        const firstValue = { first: true };
        const secondValue = { second: true };
        this.injector.map('First').to(firstValue);
        this.injector.map('Second').to(secondValue);

        this.injector.injectInto(myDependant);
        const firstMapping = this.injector.getMappingFor('First');
        const secondMapping = this.injector.getMappingFor('Second');
        expect(firstMapping.hasDependent(myDependant)).to.be.true;
        expect(secondMapping.hasDependent(myDependant)).to.be.true;

        // Release the reference to the dependent
        this.injector.release(myDependant);
        expect(firstMapping.hasDependent(myDependant)).to.be.false;
        expect(secondMapping.hasDependent(myDependant)).to.be.false;
      });

      it('tells the dependent object when a dependency changed', () => {
        const dependentObject = {
          dependencies: {
            test: 'Test'
          },
          onDependencyChanged: sinon.spy()
        };
        const firstValue = {};
        const secondValue = {};
        this.injector.map('Test').to(firstValue);
        this.injector.injectInto(dependentObject);
        this.injector.override('Test').to(secondValue);

        expect(dependentObject.onDependencyChanged).to.have.been.calledWith(
          'test', secondValue
        );
      });
    });
  });

  describe('injecting dependencies', () => {
    it(`throws error if required dependency does not exist on injection for object`, () => {
      const nonExistentId = 'not-existing-dependency-id';
      const instance = {
        dependencies: {'name': nonExistentId}
      };
      expect(() => {
        this.injector.injectInto(instance);
      }).to.throw(
        Injector.ERRORS.mappingNotFound(nonExistentId)
      );
    });

    it(`throws error if required dependency does not exist on injection for class`, () => {
      const nonExistentId = 'not-existing-dependency-id';
      @dependencies({name: nonExistentId})
      class Test {}
      const instance = new Test();
      expect(() => {
        this.injector.injectInto(instance);
      }).to.throw(
        // Needs to be as one liner
        `No mapping found for <not-existing-dependency-id> for {name: 'not-existing-dependency-id'} in <[object Object]>. Did you forget to map it in your application?`
      );
    });

    it('injects static values', () => {
      const value = {};
      this.injector.map('test').to(value);
      const instance = {
        dependencies: {value: 'test'}
      };
      this.injector.injectInto(instance);
      expect(instance.value).to.equal(value);
    });

    it('injects into provided dependencies', () => {
      const first = {dependencies: {value: 'test'}};
      const second = {dependencies: {first: 'first'}};
      this.injector.map('test').to('value');
      this.injector.map('first').to(first);

      this.injector.injectInto(second);
      expect(second.first).to.equal(first);
      expect(first.value).to.equal('value');
    });

    it('handles inherited dependencies', () => {
      @dependencies({base: 'base'})
      class Base {}
      @dependencies({extended: 'extended'})
      class Extended extends Base {}

      this.injector.map('base').to('base');
      this.injector.map('extended').to('extended');

      const instance = new Extended();
      this.injector.injectInto(instance);
      expect(instance.base).to.equal('base');
      expect(instance.extended).to.equal('extended');
    });

    it('never overrides existing properties', () => {
      const instance = {
        dependencies: {test: 'test'},
        test: 'value'
      };

      this.injector.map('test').to('test');
      this.injector.injectInto(instance);

      expect(instance.test).to.equal('value');
    });

    describe('when dependencies are ready', () => {
      it('tells the instance that they are ready', () => {
        const instance = {
          dependencies: {value: 'value'},
          onDependenciesReady: sinon.spy()
        };

        this.injector.map('value').to('value');
        this.injector.injectInto(instance);
        this.injector.injectInto(instance); // shouldn't trigger twice;

        expect(instance.onDependenciesReady).to.have.been.calledOnce;
      });

      it('tells every single instance that they are ready exactly once', () => {
        const readySpy = sinon.spy();
        class TestClass  {
          constructor() {
            this.dependencies = {value: 'test'};
            this.onDependenciesReady = readySpy;
          }
        }

        this.injector.map('test').to('test');
        this.injector.map('TestClass').toInstancesOf(TestClass);

        const first = this.injector.create('TestClass');
        const second = this.injector.create('TestClass');

        expect(readySpy).to.have.been.calledTwice;
        expect(readySpy).to.have.been.calledOn(first);
        expect(readySpy).to.have.been.calledOn(second);
      });
    });
  });


  describe('default providers', () => {

    describe('static value providers', () => {
      it('maps to static value', () => {
        const value = 'test';
        this.injector.map('first').to(value);
        this.injector.map('second').toStaticValue(value);

        expect(this.injector.get('first')).to.equal(value);
        expect(this.injector.get('second')).to.equal(value);
      });

      it('can uses static toString method if available', () => {
        class Test {
          static toString() {return 'Test';}
        }

        this.injector.map(Test).asStaticValue();
        expect(this.injector.get('Test')).to.equal(Test);
      });

      it(`converts provider to string`, () => {
        expect(
          new ValueProvider().toString()
        ).to.be.equal('Instance <ValueProvider>');
      });
    });

    describe('instance provider', () => {
      it('creates new instances for each request', () => {
        class Test {}
        this.injector.map('Test').toClass(Test);

        const first = this.injector.get('Test');
        const second = this.injector.get('Test');

        expect(first).to.be.instanceof(Test);
        expect(second).to.be.instanceof(Test);
        expect(first).not.to.equal(second);
      });

      it(`converts provider to string`, () => {
        expect(
          new InstanceProvider().toString()
        ).to.be.equal('Instance <InstanceProvider>');
      });
    });

    describe('singleton provider', () => {
      it('maps class as singleton', () => {
        class Test {
          static toString() {return 'Test';}
        }
        this.injector.map(Test).asSingleton();
        const first = this.injector.get('Test');
        const second = this.injector.get('Test');

        expect(first).to.be.instanceof(Test);
        expect(first).to.equal(second);
      });

      it('maps id to singleton of class', () => {
        class Test {}
        this.injector.map('Test').toSingleton(Test);
        const first = this.injector.get('Test');
        const second = this.injector.get('Test');

        expect(first).to.be.instanceof(Test);
        expect(first).to.equal(second);
      });

      it(`converts provider to string`, () => {
        expect(
          new SingletonProvider().toString()
        ).to.be.equal('Instance <SingletonProvider>');
      });
    });
  });
});
