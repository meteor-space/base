# Resolves a (possibly nested) path to a global object
# Returns the object or null (if not found)
Space.resolvePath = (path) ->
  if !path? or !_.isString(path) or path == ''
    throw new Error "Cannot resolve invalid path <#{path}>"

  if Space.registry[path]?
    return Space.registry[path]
  if Space.Module?.published[path]?
    return Space.Module.published[path]
  else
    throw new Error "Could not resolve path '#{path}'"

Space.namespace = (id) -> Space.registry[id] = new Space.Namespace(id)

Space.capitalizeString = (string) ->
  string.charAt(0).toUpperCase() + string.slice(1)
