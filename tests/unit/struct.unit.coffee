import {MatchError, Integer} from 'simplecheck';
import Struct from '../../source/struct.coffee';
import SpaceObject from '../../source/object.coffee';

describe 'Struct', ->
  class MyTestStruct extends Struct
    @type 'MyTestStruct'
    fields: -> name: String, age: Integer

  class MyExtendedTestStruct extends MyTestStruct
    @type 'MyExtendedTestStruct'
    fields: ->
      fields = super()
      fields.extra = Integer
      return fields

  it "is a SpaceObject", ->
    expect(Struct).to.extend(SpaceObject)

  it "calls the super constructor", ->
    constructorSpy = sinon.spy(SpaceObject.prototype, 'constructor')
    data = {}
    struct = new Struct(data)
    expect(constructorSpy).to.have.been.calledWithExactly(data)
    expect(constructorSpy).to.have.been.calledOn(struct)
    constructorSpy.restore()

  describe 'defining fields', ->

    it 'assigns the properties to the instance', ->
      properties = name: 'Dominik', age: 26
      instance = new MyTestStruct properties
      expect(instance).toMatch properties

    it 'provides a method to cast to plain object', ->
      instance = new MyTestStruct name: 'Dominik', age: 26
      copy = instance.toPlainObject()
      expect(copy.name).to.equal 'Dominik'
      expect(copy.age).to.equal 26
      expect(copy).to.be.an.object
      expect(copy).not.to.be.instanceof MyTestStruct

    it 'throws a match error if a property is of wrong type', ->
      expect(-> new MyTestStruct name: 5, age: 26).to.throw MatchError

    it 'throws a match error if additional properties are given', ->
      expect(-> new MyTestStruct name: 5, age: 26, extra: 0).to.throw MatchError

    it 'throws a match error if a property is missing', ->
      expect(-> new MyTestStruct name: 5).to.throw MatchError

    it 'allows to extend the fields of base classes', ->
      expect(-> new MyExtendedTestStruct name: 'test', age: 26, extra: 0)
      .not.to.throw MatchError

    # TODO: remove when breaking change is made for next major version:
    it 'stays backward compatible with static fields api', ->
      class StaticFieldsStruct extends Struct
        @fields: { name: String, age: Integer }

      properties = name: 'Dominik', age: 26
      instance = new StaticFieldsStruct properties
      expect(instance).toMatch properties
      expect(-> new StaticFieldsStruct name: 5).to.throw MatchError


