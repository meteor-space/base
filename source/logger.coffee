Space.Object.extend Space, 'Logger',

  _state: 'stopped'

  Constructor: ->
    @_adapters = {}

  addAdapter: (id, adapter, override=false) ->
    if not id?
      throw new Error(@ERRORS.cannotMapUndefinedId())
    if @existsAdapter(id) and !override
      throw new Error(@ERRORS.mappingExists(id))
    check(adapter, Space.Logger.Adapter)
    @_adapters[id] = adapter

  overrideAdapter: (id, item) ->
    @addAdapter(id, item, true)

  adapter: (id) ->
    return @_adapters[id] or null

  existsAdapter: (id) ->
    return (@_adapters[id]?)

  removeAdapter: (id) ->
    delete @_adapters[id] if @_adapters[id]

  adapters: ->
    return @_adapters

  start: ->
    if @_is('stopped')
      @_state = 'running'

  stop: ->
    if @_is('running')
      @_state = 'stopped'

  debug: (message) ->
    @_log 'debug', arguments

  info: (message) ->
    @_log 'info', arguments

  warning: (message) ->
    if Meteor.isClient
      @_log 'warn', arguments
    if Meteor.isServer
      @_log 'warning', arguments

  error: (message) ->
    @_log 'error', arguments

  _is: (expectedState) ->
    if @_state == expectedState
      return true

  _log: (level, message) ->
    return unless @_is('running')

    for id, adapter of @_adapters
      adapter[level].apply adapter, message

  ERRORS:
    cannotMapUndefinedId: ->
      return "Cannot add adapter with <null> or <undefined> id"
    mappingExists: (id) ->
      return "Adapter with id <#{id}> would be overwritten.
      Use method <Space.Logger::overrideAdapter> for that"