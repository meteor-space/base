
describe 'Space.Injector', ->

  beforeEach ->
    @injector = new Space.Injector()
    @injector.addProvider 'to', Space.Class.extend
      Constructor: (id, @value) -> @provide = -> @value

  # ============ MAPPINGS ============ #

  describe 'working with mappings', ->

    it 'maps a string id to given value', ->
      value = {}
      @injector.map('test').to value
      expect(@injector.get('test')).to.equal value

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

  # ========== INJECTING DEPENDENCIES ========= #

  describe 'injecting dependencies', ->

    it 'injects static values', ->
      value = {}
      @injector.map('test').to value
      instance = Space.Class.create Dependencies: value: 'test'
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
      Base = Space.Class.extend Dependencies: base: 'base'
      Extended = Base.extend Dependencies: extended: 'extended'
      @injector.map('base').to 'base'
      @injector.map('extended').to 'extended'

      instance = new Extended()
      @injector.injectInto instance
      expect(instance.base).to.equal 'base'
      expect(instance.extended).to.equal 'extended'

  # ============ ADDING PROVIDERS ============ #

  describe 'adding complex providers', ->

    it 'adds provider that maps as singleton', ->

      @injector.addProvider 'asSingleton', Space.Class.extend
        Constructor: (@Class) ->
        provide: ->
          if not @_singleton? then @_singleton = new @Class()
          return @_singleton

      class Test
        @toString: -> 'Test'

      @injector.map(Test).asSingleton()
      first = @injector.get(Test)
      second = @injector.get(Test)

      expect(first).to.be.instanceof Test
      expect(first).to.equal second

    it 'adds provider that maps to singleton', ->

      @injector.addProvider 'toSingleton', Space.Class.extend
        Constructor: (id, @Class) ->
        provide: ->
          if not @_singleton? then @_singleton = new @Class()
          return @_singleton

      class Test

      @injector.map('Test').toSingleton Test
      first = @injector.get('Test')
      second = @injector.get('Test')

      expect(first).to.be.instanceof Test
      expect(first).to.equal second
