import SpaceError from '../../src/error.js';
import {MatchError} from 'simplecheck';
import {expect} from 'chai';

describe("SpaceError", function() {

  class MyError extends SpaceError {
    constructor(messageOrData = 'The default message for this error') {
      super(messageOrData);
    }
  }

  class MyOtherError extends SpaceError {
    message = 'The other default message for this error';
  }

  class MyCustomError extends MyError {
    fields() {
      return Object.assign(super.fields(), {
        customField: String
      });
    }
  }

  it("is an instance of Error", () => {
    expect(new MyError()).to.be.instanceof(Error);
  });

  it("has same behavior as Error", () => {
    const data = { message: 'test', code: 123 };
    const error = new MyError(data);
    expect(error).to.be.instanceof(Error);
    expect(error).to.be.instanceof(MyError);
    expect(error.name).to.equal('MyError');
    expect(error.message).to.equal(data.message);
    expect(error.code).to.equal(data.code);
  });

  describe(`construction`, () => {
    it(`can be instantiated without passed arguments`, () => {
      const error = new SpaceError();
      expect(error.message).to.be.equal('');
    });

    it("takes an optional message as a string during construction", () => {
      const myMessage = 'this is a custom message';
      expect(() => {throw new MyError(myMessage);}).to.throw(myMessage);
    });

    it("takes an optional properties matching fields pattern on construction", () => {
      const data = { message: 'test', code: 123, customField: 'test' };
      const error = new MyCustomError(data);
      expect(error.customField).to.equal('test');
    });

    it(`allows to set message as instance property via class properties `, () => {
      expect(new MyOtherError().message).to.be.equal(
        'The other default message for this error'
      );
    });

    it("throws the prototype message by default", () => {
      expect(() => {throw new MyError();}).to.throw(MyError.prototype.message);
    });

    it("includes a stack trace", () => {
      const error = new MyError();
      expect(error.stack).to.be.a.string;
    });

    it(`throws error match error if passed argument is not a string or object`, () => {
      expect(() => {throw new MyError(1234);}).to.throw(MatchError);
    });

    it(`ensures that additional custom fields are matching fields pattern`, () => {
      expect(() => {
        throw new MyCustomError({customField: 'foo'});
      }).to.not.throw(MatchError);
      expect(() => {
        throw new MyCustomError({customField: 1234});
      }).to.throw(MatchError);
    });
  });

  describe(`converison`, () => {
    it(`returns data as plain object`, () => {
      const data = { message: 'not found', code: 404,  customField: 'foo'};
      const error = new MyCustomError(data);
      expect(error.toPlainObject()).to.be.sameAs(data);
    });
  });
});
