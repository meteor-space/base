import _ from 'underscore';
import {ensure, oneOf, anything} from 'simplecheck';

class SpaceObject

  # ============= PUBLIC PROTOTYPE ============== #

  # Assign given properties to the instance
  constructor: (properties) ->
    @_invokeConstructionCallbacks.apply(this, arguments)
    # Copy properties to instance by default
    @[key] = value for key, value of properties

  onDependenciesReady: ->
    # Let mixins initialize themselves when dependencies are ready
    for mixin in @constructor._getAppliedMixins()
      mixin.onDependenciesReady?.call(this)

  toString: -> @constructor.toString()

  hasSuperClass: -> @constructor.__super__?

  # Returns either the super class constructor (if no param given) or
  # the prototype property or method with [key]
  superClass: (key) ->
    sup = @constructor.__super__.constructor
    if key? then sup.prototype[key] else sup

  # Returns true if the passed in mixin has been applied to this or a super class
  hasMixin: (mixin) -> _.contains(@constructor._getAppliedMixins(), mixin)

  # This method needs to stay separate from the constructor so that
  # Space.Error can use it too!
  _invokeConstructionCallbacks: ->
    # Let mixins initialize themselves on construction
    for mixin in @constructor._getAppliedMixins()
      mixin.onConstruction?.apply(this, arguments)

  # ============= PUBLIC STATIC ============== #

  # Extends this class and return a child class with inherited prototype
  # and static properties.
  #
  # There are various ways you can call this method:
  #
  # 1. SpaceObject.extend()
  # --------------------------------------------
  # Creates an anonymous child class without extra prototype properties.
  # Basically the same as `class extend SpaceObject` in coffeescript
  #
  # 2. SpaceObject.extend(className)
  # --------------------------------------------
  # Creates a named child class without extra prototype properties.
  # Basically the same as `class ClassName extend SpaceObject` in coffeescript
  #
  # 3. SpaceObject.extend(classPath)
  # --------------------------------------------
  # Creates a child class with fully qualified class path like "my.custom.Class"
  # assigned and registered internally so that Space.resolvePath can find it.
  # This also assigns the class path as type, which can be used for serialization
  #
  # 4. SpaceObject.extend({ prop: 'first', … })
  # --------------------------------------------
  # Creates an anonymous child class with extra prototype properties.
  # Same as:
  # class extend SpaceObject
  #   prop: 'first'
  #
  # 5. SpaceObject.extend(namespace, className)
  # --------------------------------------------
  # Creates a named class which inherits from SpaceObject and assigns
  # it to the given namespace object.
  #
  # 6. SpaceObject.extend(className, prototype)
  # --------------------------------------------
  # Creates a named class which inherits from SpaceObject and extra prototype
  # properties which are assigned to the new class
  #
  # 7. SpaceObject.extend(classPath, prototype)
  # --------------------------------------------
  # Creates a registered class which inherits from SpaceObject and extra prototype
  # properties which are assigned to the new class
  #
  # 8. SpaceObject.extend(namespace, className, prototype)
  # --------------------------------------------
  # Creates a named class which inherits from SpaceObject, has extra prototype
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

    ensure namespace, oneOf(anything, Space.Namespace, Function)
    ensure classPath, oneOf(String, null)
    ensure className, String
    ensure extension, anything

    # Assign the optional custom constructor for this class
    Parent = this
    Constructor = extension.Constructor ? -> Parent.apply(this, arguments)

    # Create a named constructor for this class so that debugging
    # consoles are displaying the class name nicely.
    Child = new Function('initialize', 'return function ' + className + '() {
      initialize.apply(this, arguments);
    }')(Constructor)

    # Add subclass to parent class
    Parent._subClasses.push(Child)

    # Copy the static properties of this class over to the extended
    Child[key] = this[key] for key of this
    Child._subClasses = []

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
  # e.g.: SpaceObject.create() would return an instance of SpaceObject
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

  # Returns true if this class has a super class
  @hasSuperClass: -> @__super__?

  @isSubclassOf: (sup) ->
    isSubclass = this.prototype instanceof sup
    isSameClass = this is sup
    return isSubclass || isSameClass

  # Returns either the super class constructor (if no param given) or
  # the static property or method with [key]
  @superClass: (key) ->
    return undefined if !@__super__?
    sup = @__super__.constructor
    if key? then sup[key] else sup

  # Returns a flat, uniq array of all sub classes
  @subClasses: ->
    subs = [].concat(@_subClasses)
    subs = subs.concat(subClass.subClasses()) for subClass in subs
    return _.uniq(subs)

  # Returns true if the passed in mixin has been applied to this or a super class
  @hasMixin: (mixin) -> _.contains(@_getAppliedMixins(), mixin)

  # ============= PRIVATE STATIC ============== #

  @_subClasses: []

  @_applyMixin: (mixin) ->
    # Add the original mixin to the registry so we can ask if a specific
    # mixin has been added to a host class / instance
    # Each class has its own mixins array
    hasMixins = @_appliedMixins?
    areInherited = hasMixins and @superClass('_appliedMixins') is @_appliedMixins
    if !hasMixins or areInherited then @_appliedMixins = []

    # Keep the mixins array clean from duplicates
    @_appliedMixins.push(mixin) if !_.contains(@_appliedMixins, mixin)

    # Create a clone so that we can remove properties without affecting the global mixin
    mixinCopy = _.clone mixin

    # Remove hooks from mixin, so that they are not added to host class
    delete mixinCopy.onDependenciesReady
    delete mixinCopy.onConstruction

    # Mixin static properties into the host class
    if mixinCopy.statics?
      statics = mixinCopy.statics
      _.extend(this, statics)
      _.extend(sub, statics) for sub in @subClasses()
      delete mixinCopy.statics

    # Give mixins the chance to do static setup when applied to the host class
    mixinCopy.onMixinApplied?.call this
    delete mixinCopy.onMixinApplied

    # Copy over the mixin to the prototype and merge objects
    @_mergeIntoPrototype @prototype, mixinCopy

  @_getAppliedMixins: ->
    mixins = []
    mixins = mixins.concat(@superClass()._getAppliedMixins()) if @hasSuperClass()
    mixins = mixins.concat(@_appliedMixins) if @_appliedMixins?
    return _.uniq(mixins)

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

export default SpaceObject;