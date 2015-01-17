
class Space.Class

  constructor: (properties) -> @[key] = value for key, value of properties

  @extend: (extension) ->

    Constructor = null

    Extended = class extends this
      constructor: ->
        if Constructor? then Constructor.apply(this, arguments) else super

    if typeof(extension) is 'function'
      # Call static constructor method with the class as context
      extension = extension.call Extended
    else
      extension = extension ? {}

    Constructor = extension.Constructor ? null
    Extended.prototype[key] = extension[key] for key of extension

    return Extended

  @create: ->
    args = arguments
    Context = this
    wrapper = -> Context.apply this, args
    wrapper extends Context
    new wrapper()
