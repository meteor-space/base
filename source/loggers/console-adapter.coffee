Space.Logger.Adapter.extend 'Space.Logger.ConsoleAdapter',

  _lib: null

  Constructor: (transports=[]) ->
    @_lib = console

  addTransport: ->
    @_lib.add.apply @_lib, arguments

  debug: (message) ->
    check message, String
    @_log 'debug', arguments

  info: (message) ->
    check message, String
    @_log 'info', arguments

  warning: (message) ->
    check message, String
    @_log 'warn', arguments

  error: (message) ->
    check message, String
    @_log 'error', arguments

  _log: (level, message) ->
    @_lib[level].apply @_lib, message
