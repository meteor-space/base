describe("Space.Error", function () {

  MyError = Space.Error.extend('MyError', {
    message: 'The default message for this error'
  });

  it("throws the prototype message by default", function () {
    function throwWithDefaultMessage() {
      throw new MyError();
    }
    expect(throwWithDefaultMessage).to.throw(MyError.prototype.message);
  });

  it("takes an optional message during construction", function () {
    var myMessage = 'this is a custom message';
    function throwWithCustomMessage() {
      throw new MyError(myMessage);
    }
    expect(throwWithCustomMessage).to.throw(myMessage);
  });

  it("includes a stack trace", function () {
    error = new MyError();
    expect(error.stack).to.be.a.string;
  });

});
