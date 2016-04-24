winston = Npm.require('winston')

Space.Logger.Adapter.extend 'Space.Logger.WinstonAdapter',

  Constructor: (transports) ->
    lib = new winston.Logger({
      transports: transports or []
    })
    lib.setLevels(winston.config.syslog.levels)
    @setLib(lib)

  addTransport: ->
    @_lib.add.apply @_lib, arguments

  removeTransport: ->
    @_lib.remove.apply @_lib, arguments

  hasTransport: (name) ->
    return @_lib.transports[transportName]?

  setMinLevel: (transportName, levelName) ->
    unless @hasTransport(transportName)
      throw new Error(@ERRORS.transportNotAdded(transportName))
    @_lib.transports[transportName].level = levelName

  ERRORS:
    transportNotAdded: (transportName) ->
      return "Winston transport with #{transportName} is not added"