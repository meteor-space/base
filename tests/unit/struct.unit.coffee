
describe 'Space.Struct', ->

  class TestStruct extends Space.Struct
    fields: -> name: String, age: Match.Integer

  class ExtendedTestStruct extends TestStruct
    fields: ->
      fields = super()
      fields.extra = Match.Integer
      return fields

  class StructWithNestedStructs extends Space.Struct
    fields: -> {
      extended: ExtendedTestStruct
      subs: [TestStruct]
    }

  exampleNestedStructData = {
    extended: { $type: 'ExtendedTestStruct', name: 'Test', age: 10, extra: 1 }
    subs: [
      { $type: 'TestStruct', name: 'Bla', age: 2 }
      { $type: 'TestStruct', name: 'Blub', age: 5 }
    ]
  }

  describe 'defining fields', ->

    it 'assigns the properties to the instance', ->
      properties = name: 'Dominik', age: 26
      instance = new TestStruct properties
      expect(instance).toMatch properties

    it 'provides a method to cast to plain object', ->
      instance = new TestStruct name: 'Dominik', age: 26
      copy = instance.toPlainObject()
      expect(copy.name).to.equal 'Dominik'
      expect(copy.age).to.equal 26
      expect(copy).to.be.an.object
      expect(copy).not.to.be.instanceof TestStruct

    it 'throws a match error if a property is of wrong type', ->
      expect(-> new TestStruct name: 5, age: 26).to.throw Match.Error

    it 'throws a match error if additional properties are given', ->
      expect(-> new TestStruct name: 5, age: 26, extra: 0).to.throw Match.Error

    it 'throws a match error if a property is missing', ->
      expect(-> new TestStruct name: 5).to.throw Match.Error

    it 'allows to extend the fields of base classes', ->
      expect(-> new ExtendedTestStruct name: 'test', age: 26, extra: 0)
      .not.to.throw Match.Error

    # TODO: remove when breaking change is made for next major version:
    it 'stays backward compatible with static fields api', ->
      class TestStruct extends Space.Struct
        @fields: { name: String, age: Match.Integer }

      properties = name: 'Dominik', age: 26
      instance = new TestStruct properties
      expect(instance).toMatch properties
      expect(-> new TestStruct name: 5).to.throw Match.Error

  describe "::toData", ->

    it "returns a hierarchy of plain data objects", ->
      myStruct = new StructWithNestedStructs {
        extended: new ExtendedTestStruct(name: 'Test', age: 10, extra: 1)
        subs: [
          new TestStruct(name: 'Bla', age: 2)
          new TestStruct(name: 'Blub', age: 5)
        ]
      }
      expect(myStruct.toData()).to.deep.equal exampleNestedStructData

  describe ".fromData", ->

    it "constructs the struct hierarchy from plain data object hierarchy", ->

      myStruct = StructWithNestedStructs.fromData exampleNestedStructData
      expect(myStruct).to.be.instanceOf(StructWithNestedStructs)
      expect(myStruct.extended).to.be.instanceOf(ExtendedTestStruct)
      expect(myStruct.subs[0].toData()).to.deep.equal exampleNestedStructData.subs[0]
      expect(myStruct.subs[1].toData()).to.deep.equal exampleNestedStructData.subs[1]


