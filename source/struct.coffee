import _ from 'underscore';
import {ensure} from 'simplecheck';
import SpaceObject from './object.coffee';

class Struct extends SpaceObject

  @fields: {}

  constructor: (data={}) ->
    @_checkFields(data)
    super

  fields: -> _.clone(@constructor.fields) ? {}

  toPlainObject: ->
    copy = {}
    copy[key] = @[key] for key of @fields() when @[key] != undefined
    return copy

  # Use the fields configuration to check given data during runtime
  _checkFields: (data) -> ensure data, @fields()

export default Struct;
