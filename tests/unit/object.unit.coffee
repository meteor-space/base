
describe 'Space.Object', ->

  describe 'extending', ->

    it 'creates and returns a subclass', ->

      MyClass = Space.Object.extend()
      expect(MyClass).to.extend Space.Object

    it 'applies the arguments to the super constructor', ->

      [first, second, third] = ['first', 2, {}]
      spy = sinon.spy()

      Base = Space.Object.extend Constructor: -> spy.apply this, arguments
      Extended = Base.extend()

      instance = new Extended first, second, third

      expect(spy).to.have.been.calledWithExactly first, second, third
      expect(spy).to.have.been.calledOn instance

    it 'allows to extend the prototype', ->

      First = Space.Object.extend first: 1, get: (property) -> @[property]
      Second = First.extend second: 2, get: -> First::get.apply this, arguments
      class Third extends Second
        get: (property) -> super property

      instance = new Third()
      expect(instance.get('first')).to.equal 1
      expect(instance.get('second')).to.equal 2

    it 'allows to define static properties', ->

      class Base extends Space.Object
        @setStatic: (key, value) -> @[key] = value

      MyClass = Base.extend ->
        @setStatic 'static', 'static'
        normal: 'normal'

      expect(MyClass.static).to.equal 'static'
      expect(MyClass.create().normal).to.equal 'normal'

  describe 'creating instances', ->

    it 'creates a new instance of given class', ->
      expect(Space.Object.create()).to.be.instanceof Space.Object

    it 'allows to initialize the instance with given properties', ->
      instance = Space.Object.create first: 1, get: (property) -> @[property]
      expect(instance.get 'first').to.equal 1

    it 'forwards any number of arguments to the constructor', ->
      Base = Space.Object.extend Constructor: (@first, @second) ->

      instance = Base.create 1, 2

      expect(instance.first).to.equal 1
      expect(instance.second).to.equal 2
