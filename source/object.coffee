
class Space.Class

  constructor: (properties) -> @[key] = value for key, value of properties

  @extend: (extension) ->

    extension ?= {}
    Constructor = extension.Constructor ? null

    Extended = class extends this
      constructor: ->
        if Constructor?
          Constructor.apply this, arguments
        else
          Extended.__super__.constructor.apply this, arguments

    if extension.Static? then extension.Static.call Extended
    Extended.prototype[key] = extension[key] for key of extension

    return Extended

  @create: ->
    args = arguments
    Context = this
    wrapper = -> Context.apply this, args
    wrapper extends Context
    new wrapper()
