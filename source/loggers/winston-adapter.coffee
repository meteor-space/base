winston = Npm.require('winston')

Space.Logger.Adapter.extend 'Space.Logger.WinstonAdapter',

  _lib: null

  Constructor: (transports) ->
    @_lib = new winston.Logger({
      transports: transports or []
    })
    @_lib.setLevels(winston.config.syslog.levels)

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
    @_log 'warning', arguments

  error: (message) ->
    check message, String
    @_log 'error', arguments

  _log: (level, message) ->
    @_lib[level].apply @_lib, message
