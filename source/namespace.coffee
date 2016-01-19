class Namespace
  constructor: (@_path) ->
  getPath: -> this._path

# Define global namespace for the space framework
@Space = new Namespace 'Space'
@Space.Namespace = Namespace
@Space.registry = {}