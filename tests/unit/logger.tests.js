describe("Space.Logger", function () {

  beforeEach(function(){
    this.log = new Space.Logger()
  });

  it('extends Space.Object', function(){
    expect(Space.Logger).to.extend(Space.Object)
  });

  it("is available of both client and server", function () {
    if(Meteor.isServer || Meteor.isClient)
      expect(this.log).to.be.instanceOf(Space.Logger);
  });

  it("only logs after starting", function () {
    this.log.start()
    this.log._logger.info = sinon.spy()
    let message = 'My Log Message'
    this.log.info(message);
    expect(this.log._logger.info).to.be.calledWithExactly(message);
  });

  it("it can log an info message to the output channel", function () {
    this.log.start()
    this.log._logger.info = sinon.spy()
    let message = 'My Log Message'
    this.log.info(message);
    expect(this.log._logger.info).to.be.calledWithExactly(message);
  });

  it("it can log a warn message to the output channel", function () {
    this.log.start()
    this.log._logger.warn = sinon.spy()
    let message = 'My Log Message'
    this.log.warn(message);
    expect(this.log._logger.warn).to.be.calledWithExactly(message);
  });

  it("it can log an error message to the output channel", function () {
    this.log.start()
    this.log._logger.error = sinon.spy()
    let message = 'My Log Message'
    this.log.error(message);
    expect(this.log._logger.error).to.be.calledWithExactly(message);
  });

  it("allows logging output to be stopped", function () {
    this.log._logger.info = sinon.spy()
    this.log.start()
    expect(this.log._state).to.equal('running');
    this.log.stop()
    let message = 'My Log Message'
    this.log.info(message);
    expect(this.log._logger.info).not.to.be.called;
    expect(this.log._state).to.equal('stopped');
  });

});
