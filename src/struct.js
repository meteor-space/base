import {ensure} from 'simplecheck';
import {isNil} from 'lodash';

class Struct {

  /**
  * Returns required fields pattern for data.
  * @return {Object}
  */
  fields() {
    return {};
  }

  /**
   * Create a Struct.
   * @param  {Object} data Data matching fields pattern.
   * @throws {MatchError} Will throw an error if the passed data object does
   * not match fields pattern.
   */
  constructor(data = {}) {
    this._ensureDataMatchesFieldsPattern(data);

    for (let [key, value] of Object.entries(data)) {
      this[key] = value;
    }
  }

  /**
   * Converts Struct data to plain object.
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
   * not match fields pattern.
   */
  _ensureDataMatchesFieldsPattern(data) {
    ensure(data, this.fields());
  }
}

export default Struct;
