
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

  toData: ->
    data = {}
    for key, Type of @fields() when @[key] != undefined
      if Type.isSubclassOf?(Space.Struct)
        data[key] = @[key].toData()
      else
        data[key] = @[key]
    return data

  @fromData: (raw) ->
    data = {}
    for key, Type of this::fields() when raw[key] != undefined
      if Type.isSubclassOf?(Space.Struct)
        data[key] = Type.fromData raw[key]
      else
        data[key] = raw[key]
    return new this(data)

  # Use the fields configuration to check given data during runtime
  _checkFields: (data) -> check data, @fields()

  # Copy data to instance
  _assignData: (data) -> @[key] = data[key] for key of data
