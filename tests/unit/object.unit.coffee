
describe 'Space.Object', ->

  describe 'extending classes', ->

    it 'creates and returns a subclass', ->

      MyClass = Space.Object.extend()
      expect(MyClass).to.extend Space.Object

    it 'applies the arguments to the super constructor', ->

      [first, second, third] = ['first', 2, {}]
      constructionSpy = sinon.spy()

      class Base extends Space.Object
        constructor: -> constructionSpy.apply this, arguments

      Extended = Base.extend()
      new Extended first, second, third

      expect(constructionSpy).to.have.been.calledWithExactly first, second, third

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

      MyClass = Base.extend

        Static: ->
          @first = 1
          @setStatic 'second', 2

      expect(MyClass.first).to.equal 1
      expect(MyClass.second).to.equal 2

  describe 'creating instances', ->

    it 'creates a new instance of given class', ->
      expect(Space.Object.create()).to.be.instanceof Space.Object

    it 'allows to initialize the instance with given properties', ->
      instance = Space.Object.create first: 1, get: (property) -> @[property]
      expect(instance.get 'first').to.equal 1
