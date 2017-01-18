import {MatchError, Integer} from 'simplecheck';
import Struct from '../../src/struct.js';
import {expect} from 'chai';

describe('Struct', function() {

  class MyTestStruct extends Struct {
    fields() {
      return {name: String, age: Integer};
    }
  }

  class MyExtendedTestStruct extends MyTestStruct {
    fields() {
      return Object.assign(super.fields(), {
        extra: Integer
      });
    }
  }

  it(`returns empty object as default fields`, () => {
    expect(new Struct({}).fields()).to.be.eql({});
  });

  describe('defining fields', () => {
    it('assigns the properties to the instance', () => {
      const properties = {name: 'Dominik', age: 26};
      const instance = new MyTestStruct(properties);
      expect(instance).to.be.sameAs(properties);
    });

    it('throws a match error if a property is of wrong type', () => {
      const properties = {name: 5, age: 26};
      expect(() => new MyTestStruct(properties)).to.throw(MatchError);
    });

    it('throws a match error if additional properties are given', () => {
      const properties = {name: 5, age: 26, extra: 0};
      expect(() => new MyTestStruct(properties)).to.throw(MatchError);
    });

    it('throws a match error if a required property is missing', () => {
      const properties = {name: 5};
      expect(() => new MyTestStruct(properties)).to.throw(MatchError);
    });

    it('allows to extend the fields of base classes', () => {
      const properties = {name: 'test', age: 26, extra: 0};
      expect(() => new MyExtendedTestStruct(properties)).not.to.throw(MatchError);
    });
  });

  describe(`conversion`, () => {
    it('provides a method to cast to plain object', () => {
      const instance = new MyTestStruct({name: 'Dominik', age: 26});
      const copy = instance.toPlainObject();
      expect(copy.name).to.equal('Dominik');
      expect(copy.age).to.equal(26);
      expect(copy).to.be.an.object;
      expect(copy).not.to.be.instanceof(MyTestStruct);
    });
  });
});
