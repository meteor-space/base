
Injector = Space.Injector

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
      expect(=> @injector.get('test')).to.throw Error

    it 'throws error if mapping would be overriden', ->
      @injector.map('test').to 'test'
      override = => @injector.map('test').to 'other'
      expect(override).to.throw Error

    it 'allows to override mappings', ->
      @injector.map('test').to 'test'
      @injector.override('test').to 'other'
      expect(@injector.get('test')).to.equal 'other'

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

    it 'tells the instance when dependencies are ready', ->
      value = 'test'
      instance = Space.Object.create
        Dependencies: value: 'value'
        onDependenciesReady: sinon.spy()

      @injector.map('value').asStaticValue()
      @injector.injectInto instance
      @injector.injectInto instance # shouldnt trigger twice

      expect(instance.onDependenciesReady).to.have.been.calledOnce

    it 'never overrides existing properties', ->
      instance = Space.Object.create
        Dependencies: test: 'test'
        test: 'value'

      @injector.map('test').asStaticValue()
      @injector.injectInto instance

      expect(instance.test).to.equal 'value'

  # ============ DEFAULT PROVIDERS ============ #

  describe 'default providers', ->

    it 'has static value providers', ->
      value = toString: -> 'third'
      @injector.map('first').to value
      @injector.map('second').toStaticValue value
      @injector.map(value).asStaticValue()

      expect(@injector.get('first')).to.equal value
      expect(@injector.get('second')).to.equal value
      expect(@injector.get('third')).to.equal value

    it 'has provider that creates new instance for each request', ->
      class Test
      @injector.map('Test').toClass Test

      first = @injector.get 'Test'
      second = @injector.get 'Test'

      expect(first).to.be.instanceof Test
      expect(second).to.be.instanceof Test
      expect(first).not.to.equal second

    it 'has provider that maps class as singleton', ->

      class Test
        @toString: -> 'Test'

      @injector.map(Test).asSingleton()
      first = @injector.get('Test')
      second = @injector.get('Test')

      expect(first).to.be.instanceof Test
      expect(first).to.equal second

    it 'has provider that maps id to singleton of class', ->

      class Test

      @injector.map('Test').toSingleton Test
      first = @injector.get('Test')
      second = @injector.get('Test')

      expect(first).to.be.instanceof Test
      expect(first).to.equal second

  # ============ CUSTOM PROVIDERS ============ #

  describe 'adding custom providers', ->

    it 'adds the provider to the api', ->

      loremIpsum = 'lorem ipsum'

      @injector.addProvider 'toLoremIpsum', Space.Object.extend
        Constructor: -> @provide = -> loremIpsum

      @injector.map('test').toLoremIpsum()
      expect(@injector.get 'test').to.equal loremIpsum
