
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
    data = { $type: @classPath() }
    for key, Type of @fields() when @[key] != undefined
      if Type.isSubclassOf?(Space.Struct)
        data[key] = @[key].toData()
      else if _.isArray(Type)
        for value in @[key]
          data[key] = value.toData() if value instanceof Space.Struct
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
