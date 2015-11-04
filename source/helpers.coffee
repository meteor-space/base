global = this

# Resolves a (possibly nested) path to an global object
# Returns the object or null (if not found)
Space.resolvePath = (path) ->
  if path == '' then return global
  parts = path.split '.'
  result = global # Start with global namespace
  for key in parts # Move down the object chain
    result = result?[key] ? null
    # Take published space modules into account
    # to solve the Meteor package scoping problem
    if !result? then result = Space.namespaces[key]
    if !result? then result = Space.Module.published[key]
    if !result? then throw new Error "Could not resolve <#{path}>"
  return result

Space.namespace = (id) -> Space.namespaces[id] = {}

Space.capitalizeString = (string) ->
  string.charAt(0).toUpperCase() + string.slice(1)
