
class Space.Object

  # Assign given properties to the instance
  constructor: (properties) -> @[key] = value for key, value of properties

  # Extend the base class that this method is called on statically:
  # e.g: Space.Object.extend { prop1: 'value' }
  # would create a new anonymous class that extends Space.Object and
  # gets the parameter <extension> assigned as prototype
  @extend: (extension) ->

    # The new class has no special constructor by default
    Constructor = null

    # Use coffeescript to do the inheritance with support for
    # static properties which are copied to subclasses automatically
    # <this> is the static class that #extend was called on
    # e.g.: for Space.Object.extend <this> would be Space.Object
    Extended = class extends this
      # The default constructor invokes the custom provided constructor
      # if available. This allows to provide a custom one when using Javascript.
      constructor: ->
        if Constructor? then Constructor.apply(this, arguments) else super

    # This mimics the capabilities of coffeescript to script the
    # class object statically in Javascript
    if typeof(extension) is 'function'
      # Call static method with the class as context
      extension = extension.call Extended
    else
      extension = extension ? {}

    # Assign the optional custom constructor for this class
    Constructor = extension.Constructor ? null
    # Copy the extension over to the class prototype
    Extended.prototype[key] = extension[key] for key of extension
    return Extended

  # Create and instance of the class that this method is called on
  # e.g.: Space.Object.create() would return an instance of Space.Object
  @create: ->
    # Use a wrapper class to hand the constructor arguments
    # to the context class that #create was called on
    args = arguments
    Context = this
    wrapper = -> Context.apply this, args
    wrapper extends Context
    new wrapper()

  # Mixin properties and methods to the class prototype and merge
  # properties that are plain objects to support the mixin of configs etc.
  @mixin: (mixin) ->

    # Helper function to check for object literals only
    isPlainObject = (value) ->
      _.isObject(value) and !_.isArray(value) and !_.isFunction(value)

    # Copy over the mixin to the prototype and merge objects
    for key, value of mixin
      if isPlainObject(value) and isPlainObject(@prototype[key])
        _.extend @prototype[key], value
      else
        @prototype[key] = value
