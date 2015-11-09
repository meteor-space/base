
describe 'Space.Object', ->

  beforeEach -> @namespace = {}

  describe 'extending', ->

    it 'creates and returns a subclass', ->

      Space.Object.extend(@namespace, 'MyClass')
      expect(@namespace.MyClass).to.extend Space.Object

    it 'applies the arguments to the super constructor', ->

      [first, second, third] = ['first', 2, {}]
      spy = sinon.spy()

      Space.Object.extend @namespace, 'Base', {
        Constructor: -> spy.apply this, arguments
      }
      @namespace.Base.extend(@namespace, 'Extended')
      instance = new @namespace.Extended first, second, third

      expect(spy).to.have.been.calledWithExactly first, second, third
      expect(spy).to.have.been.calledOn instance

    it 'allows to extend the prototype', ->

      First = Space.Object.extend {
        first: 1,
        get: (property) -> @[property]
      }

      Second = First.extend {
        second: 2,
        get: -> First::get.apply this, arguments
      }

      class Third extends Second
        get: (property) -> super property

      instance = new Third()
      expect(instance.get('first')).to.equal 1
      expect(instance.get('second')).to.equal 2

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

  describe 'mixins', ->

    it 'adds methods to the prototype', ->
      testMixin = test: ->
      TestClass = Space.Object.extend()
      TestClass.mixin testMixin
      expect(TestClass::test).to.equal testMixin.test

    it 'merges object properties', ->
      testMixin = Dependencies: second: 'second'
      TestClass = Space.Object.extend Dependencies: first: 'first'
      TestClass.mixin testMixin
      expect(TestClass::Dependencies.first).to.equal 'first'
      expect(TestClass::Dependencies.second).to.equal 'second'

    it "can provide a hook that is called when the mixin is applied", ->
      myMixin = onMixinApplied: sinon.spy()
      TestClass = Space.Object.extend()
      TestClass.mixin myMixin
      expect(myMixin.onMixinApplied).to.have.been.calledOnce

    it "can provide a hook that is called when dependencies of host class are ready", ->
      myMixin = onDependenciesReady: sinon.spy()
      TestClass = Space.Object.extend()
      TestClass.mixin myMixin
      new TestClass().onDependenciesReady()
      expect(myMixin.onDependenciesReady).to.have.been.calledOnce

    it "inherits the onDependenciesReady hooks to sub classes", ->
      firstMixin = onDependenciesReady: sinon.spy()
      secondMixin = onDependenciesReady: sinon.spy()
      SuperClass = Space.Object.extend()
      SuperClass.mixin firstMixin
      SubClass = SuperClass.extend()
      SubClass.mixin secondMixin
      new SubClass().onDependenciesReady()
      expect(firstMixin.onDependenciesReady).to.have.been.calledOnce
      expect(secondMixin.onDependenciesReady).to.have.been.calledOnce

    it "calls inherited mixin hooks only once per chain", ->
      myMixin = onDependenciesReady: sinon.spy()
      SuperClass = Space.Object.extend()
      SuperClass.mixin myMixin
      SubClass = SuperClass.extend()
      new SubClass().onDependenciesReady()
      expect(myMixin.onDependenciesReady).to.have.been.calledOnce

    it "does not apply mixins to super classes", ->
      firstMixin = onDependenciesReady: sinon.spy()
      secondMixin = onDependenciesReady: sinon.spy()
      SuperClass = Space.Object.extend()
      SuperClass.mixin firstMixin
      SubClass = SuperClass.extend()
      SubClass.mixin secondMixin
      new SuperClass().onDependenciesReady()
      expect(firstMixin.onDependenciesReady).to.have.been.calledOnce
      expect(secondMixin.onDependenciesReady).not.to.have.been.called
