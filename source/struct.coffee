
class Space.Struct extends Space.Object

  @fields: {}

  constructor: (data) ->
    fields = @fields()
    data ?= {}
    # Use the fields configuration to check given data during runtime
    check data, fields
    # Copy data to instance
    @[key] = data[key] for key of data

  fields: -> _.clone(@constructor.fields) ? {}

  toPlainObject: ->
    fields = @fields()
    copy = {}
    copy[key] = @[key] for key of fields when @[key]?
    return copy
