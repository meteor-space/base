
class Space.Application extends Space.Module

  configuration: {
    appId: null
  }

  @define: (appName, prototype) ->
    prototype.toString = -> appName # For better debugging
    return @extend appName, prototype

  constructor: (options={}) ->
    super
    @modules = {}
    @configuration = {}
    @constructor.publishedAs = @constructor.name
    @initialize this, options.injector ? new Space.Injector()

  # Make it possible to override configuration (at any nested level)
  configure: (options) -> _.deepExtend @configuration, options
