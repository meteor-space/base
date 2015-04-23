
class Space.Struct extends Space.Object

  constructor: (data) ->
    fields = @_getFields()
    data ?= {}
    # Use the fields configuration to check given data during runtime
    if fields? then check data, fields
    # Copy data to instance
    @[key] = data[key] for key of data

  toPlainObject: ->
    fields = @_getFields() ? {}
    copy = {}
    copy[key] = @[key] for key of fields when @[key]?
    return copy

  _getFields: -> @constructor.fields
