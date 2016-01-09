@Space.Dependency = (propertyName, dependencyId) ->
  (target) ->
    if target.prototype.dependencies and not target.prototype.hasOwnProperty('Dependencies')
      target.prototype.dependencies = _.clone target.prototype.dependencies
    target.prototype.dependencies ?= {}
    target.prototype.dependencies[propertyName] = dependencyId
    return target

@Space.RequireModule = (moduleId) ->
  (target) ->
    if target.prototype.requiredModules and not target.prototype.hasOwnProperty('RequiredModules')
      target.prototype.requiredModules = _.clone target.prototype.requiredModules
    target.prototype.requiredModules ?= []
    target.prototype.requiredModules.push moduleId
    return target
