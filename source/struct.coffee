
structTypes = {}

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
    if !@constructor.classPath?
      throw new Error "You have to specify <#{@constructor.name}.classPath>
                       to make it reconstructable from data"

    data = { _type: @constructor.classPath }
    for key of @fields() when @[key] != undefined
      value = @[key]
      if value instanceof Space.Struct
        data[key] = value.toData()
      else if _.isArray(value)
        data[key] = value.map (v) -> if (v instanceof Space.Struct) then v.toData() else v
      else
        data[key] = value
    return data

  @fromData: (raw) ->
    data = {}
    for key, Type of this::fields() when raw[key] != undefined
      value = raw[key]
      if value._type?
        data[key] = structTypes[value._type].fromData raw[key]
      else if _.isArray(value)
        data[key] = value.map (v) ->
          if v._type?
            return structTypes[v._type].fromData v
          else
            return v
      else
        data[key] = value
    return new this(data)

  @type: (path, Type=this) ->
    Type.classPath = path
    structTypes[path] = Type

  @resolve: (path) -> structTypes[path]

  # Use the fields configuration to check given data during runtime
  _checkFields: (data) -> check data, @fields()

  # Copy data to instance
  _assignData: (data) -> @[key] = data[key] for key of data
