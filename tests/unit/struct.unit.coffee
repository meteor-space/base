
describe 'Space.Struct', ->

  struct = Space.namespace('struct')

  class struct.TestStruct extends Space.Struct
    @type 'struct.TestStruct'
    fields: -> name: String, age: Match.Integer

  class struct.ExtendedTestStruct extends struct.TestStruct
    @type 'struct.ExtendedTestStruct'
    fields: ->
      fields = super()
      fields.extra = Match.Integer
      return fields

  class struct.StructWithNestedStructs extends Space.Struct
    @type 'struct.StructWithNestedStructs'
    fields: -> {
      extended: struct.ExtendedTestStruct
      subs: [struct.TestStruct]
    }

  exampleNestedStructData = {
    _type: 'struct.StructWithNestedStructs'
    extended: { _type: 'struct.ExtendedTestStruct', name: 'Test', age: 10, extra: 1 }
    subs: [
      { _type: 'struct.TestStruct', name: 'Bla', age: 2 }
      { _type: 'struct.TestStruct', name: 'Blub', age: 5 }
    ]
  }

  describe 'defining fields', ->

    it 'assigns the properties to the instance', ->
      properties = name: 'Dominik', age: 26
      instance = new struct.TestStruct properties
      expect(instance).toMatch properties

    it 'provides a method to cast to plain object', ->
      instance = new struct.TestStruct name: 'Dominik', age: 26
      copy = instance.toPlainObject()
      expect(copy.name).to.equal 'Dominik'
      expect(copy.age).to.equal 26
      expect(copy).to.be.an.object
      expect(copy).not.to.be.instanceof struct.TestStruct

    it 'throws a match error if a property is of wrong type', ->
      expect(-> new struct.TestStruct name: 5, age: 26).to.throw Match.Error

    it 'throws a match error if additional properties are given', ->
      expect(-> new struct.TestStruct name: 5, age: 26, extra: 0).to.throw Match.Error

    it 'throws a match error if a property is missing', ->
      expect(-> new struct.TestStruct name: 5).to.throw Match.Error

    it 'allows to extend the fields of base classes', ->
      expect(-> new struct.ExtendedTestStruct name: 'test', age: 26, extra: 0)
      .not.to.throw Match.Error

    # TODO: remove when breaking change is made for next major version:
    it 'stays backward compatible with static fields api', ->
      class StaticFieldsStruct extends Space.Struct
        @fields: { name: String, age: Match.Integer }

      properties = name: 'Dominik', age: 26
      instance = new StaticFieldsStruct properties
      expect(instance).toMatch properties
      expect(-> new StaticFieldsStruct name: 5).to.throw Match.Error

  describe "::toData", ->

    it "returns a hierarchy of plain data objects", ->
      myStruct = new struct.StructWithNestedStructs {
        extended: new struct.ExtendedTestStruct(name: 'Test', age: 10, extra: 1)
        subs: [
          new struct.TestStruct(name: 'Bla', age: 2)
          new struct.TestStruct(name: 'Blub', age: 5)
        ]
      }
      expect(myStruct.toData()).to.deep.equal exampleNestedStructData

  describe ".fromData", ->

    it "constructs the struct hierarchy from plain data object hierarchy", ->

      myStruct = struct.StructWithNestedStructs.fromData exampleNestedStructData
      expect(myStruct).to.be.instanceOf(struct.StructWithNestedStructs)
      expect(myStruct.extended).to.be.instanceOf(struct.ExtendedTestStruct)
      expect(myStruct.subs[0].toData()).to.deep.equal exampleNestedStructData.subs[0]
      expect(myStruct.subs[1].toData()).to.deep.equal exampleNestedStructData.subs[1]


