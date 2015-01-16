
class Space.Object

  constructor: (properties) -> @[key] = value for key, value of properties

  @extend: (prototype) ->
    Extended = class extends this

    if prototype?
      if prototype.Static? then prototype.Static.call Extended
      Extended.prototype[key] = prototype[key] for key of prototype

    return Extended

  @create: (properties) -> new this properties
