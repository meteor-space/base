
global = this

# Resolves a (possibly nested) path to a global object
# Returns the object or null (if not found)
Space.resolvePath = (path) ->
  if !path? then throw new Error "Cannot resolve invalid path <#{path}>"
  if path == '' then return global

  # If there is a direct reference just return it
  if Space.registry[path]? then return Space.registry[path]
  if Space.Module?.published[path]? then return Space.Module.published[path]
  parts = path.split '.'
  result = global # Start with global namespace
  for key in parts # Move down the object chain
    result = result?[key] ? null
    # Take published space modules into account
    # to solve the Meteor package scoping problem
    if !result? then throw new Error "Could not resolve path '#{path}'"
  return result

Space.namespace = (id) -> Space.registry[id] = new Space.Namespace(id)

Space.capitalizeString = (string) ->
  string.charAt(0).toUpperCase() + string.slice(1)
