
class Space.Struct extends Space.Object

  @fields: {}

  constructor: (data={}) ->
    @_checkFields(data)
    @_assignData(data)

  fields: -> _.clone(@constructor.fields) ? {}

  toPlainObject: ->
    copy = {}
    copy[key] = @[key] for key of @fields() when @[key] != undefined
    return copy

  # Use the fields configuration to check given data during runtime
  _checkFields: (data) -> check data, @fields()

  # Copy data to instance
  _assignData: (data) -> @[key] = data[key] for key of data
