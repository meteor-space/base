
Space.Struct.mixin({

  // Use the fields configuration to check given data during runtime
  _checkFields(data) {
    let fields = this.fields();
    let cleanedFields = {};
    for (let field in fields) {
      if (fields.hasOwnProperty(field)) {
        if (_.isFunction(data[field])) {
          cleanedFields[field] = Match.Any;
        } else {
          cleanedFields[field] = fields[field];
        }
      }
    }
    check(data, cleanedFields);
  }

});
