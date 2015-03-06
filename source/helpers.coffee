
global = this

Space.resolvePath = (path) ->
  path = path.split '.'
  result = global # Start with global namespace
  for key in path # Move down the object chain
    result = result[key]
  return result
