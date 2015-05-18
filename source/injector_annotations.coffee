@Dependency = (propertyName, dependencyId) ->
  (target) ->
    target.prototype.Dependencies ?= {}
    target.prototype.Dependencies[propertyName] = dependencyId
    return target

@RequireModule = (moduleId) ->
  (target) ->
    target.prototype.RequiredModules ?= []
    target.prototype.RequiredModules.push moduleId
    return target
