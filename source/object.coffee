
class Space.Object

  # Assign given properties to the instance
  constructor: (properties) -> @[key] = value for key, value of properties

  onDependenciesReady: ->
    # Let mixins initialize themselves when dependencies are ready
    callback.call(this) for callback in @_getMixinCallbacks(@constructor)

  _getMixinCallbacks: (Class) ->
    if Class.__super__?
      superMixins = @_getMixinCallbacks(Class.__super__.constructor)
      return _.union(superMixins, Class.__mixinCallbacks__ ? [])
    else
      return Class.__mixinCallbacks__ ? []

  toString: -> @constructor.toString()

  # Extends this class and return a child class with inherited prototype
  # and static properties.
  #
  # There are various ways you can call this method:
  #
  # 1. Space.Object.extend()
  # --------------------------------------------
  # Creates an anonymous child class without extra prototype properties.
  # Basically the same as `class extend Space.Object` in coffeescript
  #
  # 2. Space.Object.extend(className)
  # --------------------------------------------
  # Creates a named child class without extra prototype properties.
  # Basically the same as `class ClassName extend Space.Object` in coffeescript
  #
  # 3. Space.Object.extend(classPath)
  # --------------------------------------------
  # Creates a child class with fully qualified class path like "my.custom.Class"
  # assigned and registered internally so that Space.resolvePath can find it.
  # This also assigns the class path as type, which can be used for serialization
  #
  # 4. Space.Object.extend({ prop: 'first', … })
  # --------------------------------------------
  # Creates an anonymous child class with extra prototype properties.
  # Same as:
  # class extend Space.Object
  #   prop: 'first'
  #
  # 5. Space.Object.extend(namespace, className)
  # --------------------------------------------
  # Creates a named class which inherits from Space.Object and assigns
  # it to the given namespace object.
  #
  # 6. Space.Object.extend(className, prototype)
  # --------------------------------------------
  # Creates a named class which inherits from Space.Object and extra prototype
  # properties which are assigned to the new class
  #
  # 7. Space.Object.extend(classPath, prototype)
  # --------------------------------------------
  # Creates a registered class which inherits from Space.Object and extra prototype
  # properties which are assigned to the new class
  #
  # 8. Space.Object.extend(namespace, className, prototype)
  # --------------------------------------------
  # Creates a named class which inherits from Space.Object, has extra prototype
  # properties and is assigned to the given namespace.
  @extend: (args...) ->

    # Defaults
    namespace = {}
    classPath = null
    className = '_Class' # Same as coffeescript
    extension = {}

    # Only one param: (extension) OR (className) OR (classPath) ->
    if args.length is 1
      if _.isObject(args[0]) then extension = args[0]
      if _.isString(args[0])
        # (className) OR (classPath)
        if args[0].indexOf('.') != -1
          # classPath
          classPath = args[0]
          className = classPath.substr(classPath.lastIndexOf('.') + 1)
        else
          # className
          className = classPath = args[0]

    # Two params must be: (namespace, className) OR (className, extension) ->
    if args.length is 2
      if _.isObject(args[0]) and _.isString(args[1])
        namespace = args[0]
        className = args[1]
        extension = {}
      else if _.isString(args[0]) and _.isObject(args[1])
        # (className) OR (classPath)
        namespace = {}
        extension = args[1]
        if args[0].indexOf('.') != -1
          # classPath
          classPath = args[0]
          className = classPath.substr(classPath.lastIndexOf('.') + 1)
        else
          # className
          className = classPath = args[0]

    # All three params: (namespace, className, extension) ->
    if args.length is 3
      namespace = args[0]
      className = args[1]
      extension = args[2]

    check namespace, Match.OneOf(Match.ObjectIncluding({}), Space.Namespace, Function)
    check classPath, Match.OneOf(String, null)
    check className, String
    check extension, Match.ObjectIncluding({})

    # Assign the optional custom constructor for this class
    Parent = this
    Constructor = extension.Constructor ? -> Parent.apply(this, arguments)

    # Create a named constructor for this class so that debugging
    # consoles are displaying the class name nicely.
    Child = new Function('initialize', 'return function ' + className + '() {
      initialize.apply(this, arguments);
    }')(Constructor)

    # Copy the static properties of this class over to the extended
    Child[key] = this[key] for key of this

    # Copy over static class properties defined on the extension
    if extension.statics?
      _.extend Child, extension.statics
      delete extension.statics

    # Extract mixins before they get added to prototype
    mixins = extension.mixin
    delete extension.mixin

    # Extract onExtending callback and avoid adding it to prototype
    onExtendingCallback = extension.onExtending
    delete extension.onExtending

    # Javascript prototypal inheritance "magic"
    Ctor = ->
      @constructor = Child
      return
    Ctor.prototype = Parent.prototype
    Child.prototype = new Ctor()
    Child.__super__ = Parent.prototype

    # Apply mixins
    if mixins? then Child.mixin(mixins)

    # Merge the extension into the class prototype
    @_mergeIntoPrototype Child.prototype, extension

    # Add the class to the namespace
    if namespace?
      namespace[className] = Child
      if namespace instanceof Space.Namespace
        classPath = "#{namespace.getPath()}.#{className}"

    # Add type information to the class
    Child.type classPath if classPath?

    # Invoke the onExtending callback after everything has been setup
    onExtendingCallback?.call(Child)

    return Child

  @toString: -> @classPath

  @type: (@classPath) ->
    # Register this class with its class path
    Space.registry[@classPath] = this
    try
      # Add the class to the resolved namespace
      path = @classPath.substr 0, @classPath.lastIndexOf('.')
      namespace = Space.resolvePath path
      className = @classPath.substr(@classPath.lastIndexOf('.') + 1)
      namespace[className] = this

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
  @mixin: (mixins) ->
    if _.isArray(mixins)
      @_applyMixin(mixin) for mixin in mixins
    else
      @_applyMixin(mixins)

  @_applyMixin: (mixin) ->

    # Create a clone so that we can remove properties without affecting the global mixin
    mixin = _.clone mixin

    # Register the onDependenciesReady method of mixins as a initialization callback
    mixinCallback = mixin.onDependenciesReady
    if mixinCallback?
      # A bit ugly but necessary to check that sub classes don't statically
      # inherit mixin callback arrays from their super classes (coffeescript)
      hasInheritedMixins = (
        @__super__? and
        @__super__.constructor.__mixinCallbacks__ is @__mixinCallbacks__
      )
      @__mixinCallbacks__ = [] if hasInheritedMixins or !@__mixinCallbacks__?
      @__mixinCallbacks__.push mixinCallback
      delete mixin.onDependenciesReady

    # Mixin static properties into the host class
    _.extend(this, mixin.statics) if mixin.statics?
    delete mixin.statics

    # Give mixins the chance to do static setup when applied to the host class
    mixin.onMixinApplied?.call this
    delete mixin.onMixinApplied

    # Copy over the mixin to the prototype and merge objects
    @_mergeIntoPrototype @prototype, mixin

  @isSubclassOf = (sup) ->
    isSubclass = this.prototype instanceof sup
    isSameClass = this is sup
    return isSubclass || isSameClass

  @_mergeIntoPrototype: (prototype, extension) ->
    # Helper function to check for object literals only
    isPlainObject = (value) ->
      _.isObject(value) and !_.isArray(value) and !_.isFunction(value)
    for key, value of extension
      hasProperty = prototype.hasOwnProperty(key)
      if hasProperty and isPlainObject(value) and isPlainObject(prototype[key])
        # Deep extend plain objects
        _.deepExtend(prototype[key], _.clone(value))
      else
        value = _.clone(value) if isPlainObject(value)
        # Set non-existing props and override existing methods
        prototype[key] = value
