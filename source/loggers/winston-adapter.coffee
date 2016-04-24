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

  setMinLevel: (name) ->
    for id, transports of @_lib.transports
      @_lib.transports[id].level = name