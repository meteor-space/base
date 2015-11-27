describe("Space.Error", function() {

  MyError = Space.Error.extend('MyError', {
    message: 'The default message for this error'
  });

  it("is an instance of error", function() {
    expect(new MyError()).to.be.instanceof(Error);
  });

  it("has same behavior as Space.Struct", function() {
    let data = { message: 'test', code: 123 };
    let error = new MyError(data);
    expect(error).to.be.instanceof(Error);
    expect(error).to.be.instanceof(MyError);
    expect(error.message).to.equal(data.message);
    expect(error.code).to.equal(data.code);
  });

  it("is easy to add additional fields", function() {
    MyError.fields = { customField: String };
    let data = { message: 'test', code: 123, customField: 'test' };
    let error = new MyError(data);
    expect(error.customField).to.equal('test');
    MyError.fields = {};
  });

  it("throws the prototype message by default", function() {
    let throwWithDefaultMessage = function() {
      throw new MyError();
    };
    expect(throwWithDefaultMessage).to.throw(MyError.prototype.message);
  });

  it("takes an optional message during construction", function() {
    let myMessage = 'this is a custom message';
    let throwWithCustomMessage = function() {
      throw new MyError(myMessage);
    };
    expect(throwWithCustomMessage).to.throw(myMessage);
  });

  it("includes a stack trace", function() {
    error = new MyError();
    expect(error.stack).to.be.a.string;
  });

});
