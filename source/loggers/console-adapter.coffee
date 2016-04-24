Space.Logger.Adapter.extend 'Space.Logger.ConsoleAdapter',

  Constructor: () ->
    @setLib(console)

  warning: (message) ->
    check(message, String)
    @_log('warn', arguments)
