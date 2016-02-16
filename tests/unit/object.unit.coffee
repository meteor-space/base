
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
      First = Space.Object.extend first: 1, get: (property) -> @[property]
      Second = First.extend second: 2, get: -> First::get.apply this, arguments
      class Third extends Second
        get: (property) -> super property
      instance = new Third()
      expect(instance.get('first')).to.equal 1
      expect(instance.get('second')).to.equal 2

    describe "providing fully qualified class path", ->

      it "registers the class for internal lookup", ->
        Space.namespace('My.custom')
        FirstClass = Space.Object.extend('My.custom.FirstClass', {})
        SecondClass = Space.Object.extend('My.custom.SecondClass', {})
        expect(Space.resolvePath 'My.custom.FirstClass').to.equal(FirstClass)
        expect(Space.resolvePath 'My.custom.SecondClass').to.equal(SecondClass)

      it "assigns the class path", ->
        className = 'My.custom.Class'
        MyClass = Space.Object.extend(className)
        expect(MyClass.toString()).to.equal(className)
        expect(new MyClass().toString()).to.equal(className)

      it "exposes the class on the global scope if possible", ->
        my = {}
        my.namespace = Space.namespace('my.namespace')
        MyClass = Space.Object.extend('my.namespace.MyClass')
        expect(my.namespace.MyClass).to.equal(MyClass)

      it "works correctly without nested namespaces", ->
        MyClass = Space.Object.extend('MyClass')
        expect(Space.resolvePath 'MyClass').to.equal(MyClass)

    describe "working with static class properties", ->

      it 'allows you to define static class properties', ->
        myStatics = {}
        MyClass = Space.Object.extend statics: { myStatics: myStatics }
        expect(MyClass.myStatics).to.equal(myStatics)

      it 'provides an api for defining a callback while extending', ->
        onExtendingSpy = sinon.spy()
        MyClass = Space.Object.extend onExtending: onExtendingSpy
        expect(onExtendingSpy).to.have.been.calledOn(MyClass)

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

  describe "inheritance helpers", ->

    Base = Space.Object.extend {
      statics: { prop: 'static', method: -> }
      prop: 'prototype'
      method: ->
    }
    Sub = Base.extend()
    GrandSub = Sub.extend()

    describe "static", ->

      it "can tell if there is a super class", ->
        expect(Sub.hasSuperClass()).to.be.true

      it "can return the super class", ->
        expect(Sub.superClass()).to.equal(Base)

      it "returns undefined if there is no super class", ->
       expect(Space.Object.superClass()).to.equal(undefined)

      it "can return a static prop or method of the super class", ->
        expect(Sub.superClass('prop')).to.equal(Base.prop)
        expect(Sub.superClass('method')).to.equal(Base.method)

      it "can give back a flat array of sub classes", ->
        expect(Base.subClasses()).to.eql [Sub, GrandSub]
        expect(Sub.subClasses()).to.eql [GrandSub]
        expect(GrandSub.subClasses()).to.eql []

    describe "prototype", ->

      it "can tell if there is a super class", ->
        expect(new Sub().hasSuperClass()).to.be.true

      it "can return the super class", ->
        expect(new Sub().superClass()).to.equal(Base)

      it "can return a static prop or method of the super class", ->
        expect(new Sub().superClass('prop')).to.equal(Base::prop)
        expect(new Sub().superClass('method')).to.equal(Base::method)

  describe 'mixins', ->

    it 'adds methods to the prototype', ->
      testMixin = test: ->
      TestClass = Space.Object.extend()
      TestClass.mixin testMixin
      expect(TestClass::test).to.equal testMixin.test

    it 'overrides existing methods of the prototype', ->
      testMixin = test: ->
      TestClass = Space.Object.extend test: ->
      TestClass.mixin testMixin
      expect(TestClass::test).to.equal testMixin.test

    it 'merges object properties', ->
      testMixin = dependencies: second: 'second'
      TestClass = Space.Object.extend dependencies: first: 'first'
      TestClass.mixin testMixin
      expect(TestClass::dependencies.first).to.equal 'first'
      expect(TestClass::dependencies.second).to.equal 'second'

    it "does not modify other mixins when merging properties", ->
      FirstMixin = dependencies: firstMixin: 'onExtending'
      FirstClass = Space.Object.extend {
        mixin: [FirstMixin]
        dependencies: first: 'first'
      }
      FirstClass.mixin dependencies: firstMixin: 'afterExtending'
      expect(FirstMixin).toMatch dependencies: firstMixin: 'onExtending'
      expect(FirstClass.prototype.dependencies).toMatch {
        first: 'first'
        firstMixin: 'afterExtending'
      }

    it "can provide a hook that is called when the mixin is applied", ->
      myMixin = onMixinApplied: sinon.spy()
      TestClass = Space.Object.extend()
      TestClass.mixin myMixin
      expect(myMixin.onMixinApplied).to.have.been.calledOnce

    it 'can be defined as prototype property when extending classes', ->
      myMixin = { onMixinApplied: sinon.spy() }
      MyClass = Space.Object.extend mixin: [myMixin]
      expect(myMixin.onMixinApplied).to.have.been.calledOn(MyClass)

    it 'can be used to mixin static properties on to the class', ->
      myMixin = statics: { myMethod: sinon.spy() }
      MyClass = Space.Object.extend mixin: [myMixin]
      MyClass.myMethod()
      expect(myMixin.statics.myMethod).to.have.been.calledOn(MyClass)

    it 'can be checked which mixins a class has', ->
      FirstMixin = {}
      SecondMixin = {}
      ThirdMixin = {}
      MyClass = Space.Object.extend({ mixin: FirstMixin })
      MyClass.mixin(SecondMixin)
      instance = new MyClass()
      # Static checks
      expect(MyClass.hasMixin(FirstMixin)).to.be.true
      expect(MyClass.hasMixin(SecondMixin)).to.be.true
      expect(MyClass.hasMixin(ThirdMixin)).to.be.false
      # Instance checks
      expect(instance.hasMixin(FirstMixin)).to.be.true
      expect(instance.hasMixin(SecondMixin)).to.be.true
      expect(instance.hasMixin(ThirdMixin)).to.be.false

    describe "mixin inheritance", ->

      it "does not apply mixins to super classes", ->
        firstMixin = {}
        secondMixin = {}
        SuperClass = Space.Object.extend mixin: firstMixin
        SubClass = SuperClass.extend mixin: secondMixin
        expect(SuperClass.hasMixin(firstMixin)).to.be.true
        expect(SuperClass.hasMixin(secondMixin)).to.be.false
        expect(SubClass.hasMixin(firstMixin)).to.be.true
        expect(SubClass.hasMixin(secondMixin)).to.be.true

      it "inherits mixins to children when added to base class later on", ->
        LateMixin = { statics: { test: 'property' } }
        # Base class with a mixin
        BaseClass = Space.Object.extend()
        # Sublcass with its own mixin
        SubClass = BaseClass.extend()
        # Later we extend base class
        BaseClass.mixin LateMixin
        # Sub class should have all three mixins correctly applied
        expect(SubClass.hasMixin(LateMixin)).to.be.true
        expect(SubClass.test).to.equal LateMixin.statics.test

    describe "onDependenciesReady hooks", ->

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

    describe "construction hooks", ->

      it "can provide a hook that is called on construction of host class", ->
        myMixin = onConstruction: sinon.spy()
        TestClass = Space.Object.extend()
        TestClass.mixin myMixin
        first = {}
        second = {}
        new TestClass(first, second)
        expect(myMixin.onConstruction).to.have.been.calledWithExactly(first, second)

