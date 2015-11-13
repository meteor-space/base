@Space.Dependency = (propertyName, dependencyId) ->
  (target) ->
    target.prototype.dependencies ?= {}
    target.prototype.dependencies[propertyName] = dependencyId
    return target

@Space.RequireModule = (moduleId) ->
  (target) ->
    target.prototype.requiredModules ?= []
    target.prototype.requiredModules.push moduleId
    return target
