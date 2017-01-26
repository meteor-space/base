import {ensure} from 'simplecheck';
import {isNil, assign} from 'lodash';

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
    const processedData = this.construction(data);
    this._ensureDataMatchesFieldsPattern(processedData, this.fields());

    for (let [key, value] of Object.entries(processedData)) {
      this[key] = value;
    }
  }

  /**
   * On construction hook.
   * @param  {Object} data Unprocessed data.
   * @return {Object} Processed data.
   */
  construction(data) {
    let processedData = assign({}, data);
    return processedData;
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
   * @param  {Object} fields Fields pattern for matching provided data.
   * @throws {MatchError} Will throw an error if the passed data object does
   * not match fields pattern.
   */
  _ensureDataMatchesFieldsPattern(data, fields = this.fields()) {
    ensure(data, fields);
  }
}

export default Struct;
