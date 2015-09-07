
Injector = Space.Injector
global = this

describe 'Space.Injector', ->

  beforeEach -> @injector = new Injector()

  # ============ MAPPINGS ============ #

  describe 'working with mappings', ->

    it 'injects into requested dependency', ->
      myObject = Dependencies: test: 'test'
      testValue = {}
      @injector.map('test').to testValue
      @injector.map('myObject').to myObject

      expect(@injector.get('myObject').test).to.equal testValue

    it 'throws error if mapping doesnt exist', ->
      expect(=> @injector.get('blablub')).to.throw Error

    it 'auto-maps singletons', ->
      first = @injector.get 'Space.Injector'
      second = @injector.get 'Space.Injector'
      expect(first).to.be.instanceof Space.Injector
      expect(first).to.equal second

    it 'auto-maps static values', ->
      expect(@injector.get('Space')).to.equal Space

    it 'throws if the auto-map value is undefined', ->
      expect(=> @injector.get('NotExistingValue')).to.throw Error

    it 'throws error if mapping would be overriden', ->
      @injector.map('test').to 'test'
      override = => @injector.map('test').to 'other'
      expect(override).to.throw Error

    it 'can remove existing mappings', ->
      @injector.map('test').to 'test'
      @injector.remove 'test'
      expect(=> @injector.get 'test').to.throw Error

    it 'provides an alias for getting values', ->
      @injector.map('test').to 'test'
      expect(@injector.create 'test').to.equal 'test'

    it 'uses the toString method if its not a string id', ->
      class TestClass extends Space.Object
        @toString: -> 'TestClass'

      @injector.map(TestClass).asSingleton()
      expect(@injector.get('TestClass')).to.be.instanceof TestClass

    it 'throws error if you try to map undefined', ->
      expect(=> @injector.map(undefined)).to.throw 'Cannot map undefined value.'
      expect(=> @injector.map(null)).to.throw 'Cannot map undefined value.'

  describe 'overriding mappings', ->

    it 'allows to override mappings', ->
      @injector.map('test').to 'test'
      @injector.override('test').to 'other'
      expect(@injector.get('test')).to.equal 'other'

    it 'dynamically updates all dependent objects with the new dependency', ->
      myObject = Dependencies: test: 'test'
      firstValue = { first: true }
      secondValue = { second: true }
      @injector.map('test').to firstValue
      @injector.injectInto myObject
      expect(myObject.test).to.equal firstValue
      @injector.override('test').to secondValue
      expect(myObject.test).to.equal secondValue

    it 'allows to de-register a dependent object from the mappings', ->
      myObject = {
        Dependencies:
          first: 'First'
          second: 'Second'
      }
      firstValue = { first: true }
      secondValue = { second: true }
      @injector.map('First').to firstValue
      @injector.map('Second').to secondValue

      @injector.injectInto myObject
      firstMapping = @injector.getMappingFor 'First'
      secondMapping = @injector.getMappingFor 'Second'
      expect(firstMapping.hasDependee(myObject)).to.be.true
      expect(secondMapping.hasDependee(myObject)).to.be.true
      # Release the reference to the dependee
      @injector.release(myObject)
      expect(firstMapping.hasDependee(myObject)).to.be.false
      expect(secondMapping.hasDependee(myObject)).to.be.false

    it 'tells the dependent object when a dependency changed', ->
      dependentObject = {
        Dependencies: {
          test: 'Test'
        }
        onDependencyChanged: sinon.spy()
      }
      firstValue = {}
      secondValue = {}
      @injector.map('Test').to firstValue
      @injector.injectInto dependentObject
      @injector.override('Test').to secondValue

      expect(dependentObject.onDependencyChanged).to.have.been.calledWith(
        'test', secondValue
      )

  # ========== INJECTING DEPENDENCIES ========= #

  describe 'injecting dependencies', ->

    it 'injects static values', ->
      value = {}
      @injector.map('test').to value
      instance = Space.Object.create Dependencies: value: 'test'
      @injector.injectInto instance
      expect(instance.value).to.equal value

    it 'injects into provided dependencies', ->
      first = Dependencies: value: 'test'
      second = Dependencies: first: 'first'
      @injector.map('test').to 'value'
      @injector.map('first').to first

      @injector.injectInto second
      expect(second.first).to.equal first
      expect(first.value).to.equal 'value'

    it 'handles inherited dependencies', ->
      Base = Space.Object.extend Dependencies: base: 'base'
      Extended = Base.extend Dependencies: extended: 'extended'
      @injector.map('base').to 'base'
      @injector.map('extended').to 'extended'

      instance = new Extended()
      @injector.injectInto instance
      expect(instance.base).to.equal 'base'
      expect(instance.extended).to.equal 'extended'

    it 'never overrides existing properties', ->
      instance = Space.Object.create
        Dependencies: test: 'test'
        test: 'value'

      @injector.map('test').to('test')
      @injector.injectInto instance

      expect(instance.test).to.equal 'value'

    describe 'when dependencies are ready', ->

      it 'tells the instance that they are ready', ->
        value = 'test'
        instance = Space.Object.create
          Dependencies: value: 'value'
          onDependenciesReady: sinon.spy()

        @injector.map('value').to('value')
        @injector.injectInto instance
        @injector.injectInto instance # shouldnt trigger twice

        expect(instance.onDependenciesReady).to.have.been.calledOnce

      it 'tells every single instance exactly once', ->
        readySpy = sinon.spy()
        class TestClass extends Space.Object
          Dependencies: value: 'test'
          onDependenciesReady: readySpy

        @injector.map('test').to 'test'
        @injector.map('TestClass').toInstancesOf TestClass

        first = @injector.create 'TestClass'
        second = @injector.create 'TestClass'

        expect(readySpy).to.have.been.calledTwice
        expect(readySpy).to.have.been.calledOn first
        expect(readySpy).to.have.been.calledOn second

  # ============ DEFAULT PROVIDERS ============ #

  describe 'default providers', ->

    describe 'static value providers', ->

      it 'maps to static value', ->
        value = 'test'
        @injector.map('first').to value
        @injector.map('second').toStaticValue value

        expect(@injector.get('first')).to.equal value
        expect(@injector.get('second')).to.equal value

      it 'supports global namespace lookup', ->
        global.Space.__test__ = TestClass: Space.Object.extend()
        path = 'Space.__test__.TestClass'
        @injector.map(path).asStaticValue()

        expect(@injector.get(path)).to.equal Space.__test__.TestClass
        delete global.Space.__test__

      it 'can uses static toString method if available', ->
        class Test
          @toString: -> 'Test'

        @injector.map(Test).asStaticValue()
        expect(@injector.get('Test')).to.equal Test

    describe 'instance provider', ->

      it 'creates new instances for each request', ->
        class Test
        @injector.map('Test').toClass Test

        first = @injector.get 'Test'
        second = @injector.get 'Test'

        expect(first).to.be.instanceof Test
        expect(second).to.be.instanceof Test
        expect(first).not.to.equal second

    describe 'singleton provider', ->

      it 'maps class as singleton', ->
        class Test
          @toString: -> 'Test'
        @injector.map(Test).asSingleton()
        first = @injector.get('Test')
        second = @injector.get('Test')

        expect(first).to.be.instanceof Test
        expect(first).to.equal second

      it 'maps id to singleton of class', ->
        class Test
        @injector.map('Test').toSingleton Test
        first = @injector.get('Test')
        second = @injector.get('Test')

        expect(first).to.be.instanceof Test
        expect(first).to.equal second

      it 'looks up the value on global namespace if only a path is given', ->
        global.Space.__test__ = TestClass: Space.Object.extend()
        @injector.map('Space.__test__.TestClass').asSingleton()

        first = @injector.get('Space.__test__.TestClass')
        second = @injector.get('Space.__test__.TestClass')

        expect(first).to.be.instanceof Space.__test__.TestClass
        expect(first).to.equal second
        delete global.Space.__test__

  # ============ CUSTOM PROVIDERS ============ #

  describe 'adding custom providers', ->

    it 'adds the provider to the api', ->

      loremIpsum = 'lorem ipsum'

      @injector.addProvider 'toLoremIpsum', Space.Object.extend
        Constructor: -> @provide = -> loremIpsum

      @injector.map('test').toLoremIpsum()
      expect(@injector.get 'test').to.equal loremIpsum
