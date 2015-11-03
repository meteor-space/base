
class Space.Application extends Space.Module

  Configuration: {
    appId: null
  }

  @define: (appName, prototype) ->
    prototype.toString = -> appName # For better debugging
    return @extend appName, prototype

  constructor: (options={}) ->
    super
    @modules = {}
    @initialize this, options.injector ? new Space.Injector(), {}

  # Make it possible to override configuration (at any nested level)
  configure: (options) -> _.deepExtend @Configuration, options
