
describe 'Space.Struct', ->

  class MyTestStruct extends Space.Struct
    @type 'MyTestStruct'
    fields: -> name: String, age: Match.Integer

  class MyExtendedTestStruct extends MyTestStruct
    @type 'MyExtendedTestStruct'
    fields: ->
      fields = super()
      fields.extra = Match.Integer
      return fields

  it "is a Space.Object", ->
    expect(Space.Struct).to.extend(Space.Object)

  it "calls the super constructor", ->
    constructorSpy = sinon.spy(Space.Object.prototype, 'constructor')
    data = {}
    struct = new Space.Struct(data)
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
      expect(-> new MyTestStruct name: 5, age: 26).to.throw Match.Error

    it 'throws a match error if additional properties are given', ->
      expect(-> new MyTestStruct name: 5, age: 26, extra: 0).to.throw Match.Error

    it 'throws a match error if a property is missing', ->
      expect(-> new MyTestStruct name: 5).to.throw Match.Error

    it 'allows to extend the fields of base classes', ->
      expect(-> new MyExtendedTestStruct name: 'test', age: 26, extra: 0)
      .not.to.throw Match.Error

    # TODO: remove when breaking change is made for next major version:
    it 'stays backward compatible with static fields api', ->
      class StaticFieldsStruct extends Space.Struct
        @fields: { name: String, age: Match.Integer }

      properties = name: 'Dominik', age: 26
      instance = new StaticFieldsStruct properties
      expect(instance).toMatch properties
      expect(-> new StaticFieldsStruct name: 5).to.throw Match.Error


