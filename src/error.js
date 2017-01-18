import {isString, isObject, isNil} from 'lodash';
import {ensure, optional, oneOf, Integer} from 'simplecheck';
import ExtendableError from 'es6-error';

class SpaceError extends ExtendableError {

  /**
  * Returns required fields pattern for data.
  * @return {Object}
  */
  fields() {
    return {
      name: String,
      message: String,
      stack: optional(String),
      code: optional(Integer)
    };
  }

  /**
   * Create an SpaceError.
   * @param  {String|Object} messageOrData Error message as string or object
   * containing message with other properties matching fields pattern.
   * @throws {MatchError} Will throw an error if the passed data object does
   * not match fields pattern.
   * @throws {MatchError} Will throw an error if the argument is not a string or
   * an object.
   */
  constructor(messageOrData = '') {
    let data = {};
    if (isString(messageOrData) || isObject(messageOrData)) {
      data = isObject(messageOrData) ? messageOrData : {message: messageOrData};
      data.message = data.message ?
        data.message : SpaceError.prototype.message || '';
    } else {
      // Throw nice error
      ensure(messageOrData, oneOf(String, Object));
    }

    super(data.message);

    let error = Error.call(this, data.message);
    data.name = error.name = this.constructor.name;
    if (error.stack !== undefined) data.stack = error.stack;

    this._ensureDataMatchesFieldsPattern(data);

    for (let [key, value] of Object.entries(data)) {
      this[key] = value;
    }
  }

  /**
   * Converts SpaceError data to plain object.
   * @return {Object}
   */
  toPlainObject() {
    const copy = {};
    for (let key of Object.keys(this.fields())) {
      if (!isNil(this[key])) {
        copy[key] = this[key];
      }
    }
    return copy;
  }

  /**
   * Ensures if provided data does match defined pattern.
   * @param  {Object} data Data to validate.
   * @throws {MatchError} Will throw an error if the passed data object does
   * not match fields definition.
   */
  _ensureDataMatchesFieldsPattern(data) {
    ensure(data, this.fields());
  }
}

export default SpaceError;
