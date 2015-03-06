
global = this

Space.resolvePath = (path) ->
  if path == '' then return global
  path = path.split '.'
  result = global # Start with global namespace
  for key in path # Move down the object chain
    result = result[key]
  return result
