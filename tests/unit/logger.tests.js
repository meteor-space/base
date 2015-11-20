describe("Space.Logger", function () {

  beforeEach(function(){
    this.log = new Space.Logger();
  });

  it('extends Space.Object', function(){
    expect(Space.Logger).to.extend(Space.Object);
  });

  it("is available of both client and server", function () {
    if (Meteor.isServer || Meteor.isClient)
      expect(this.log).to.be.instanceOf(Space.Logger);
  });

  it("only logs after starting", function () {
    this.log.start();
    this.log._logger.info = sinon.spy();
    let message = 'My Log Message';
    this.log.info(message);
    expect(this.log._logger.info).to.be.calledWithExactly(message);
  });

  it("it can log a debug message to the output channel when min level is equal but not less", function () {
    this.log.start();
    this.log.setMinLevel('debug');
    this.log._logger.debug = sinon.spy();
    let message = 'My log message';
    this.log.debug(message);
    expect(this.log._logger.debug).to.be.calledWithExactly(message)
    this.log._logger.debug = sinon.spy();
    this.log.setMinLevel('info');
    this.log.debug(message);
    expect(this.log._logger.debug).not.to.be.called;
  });

  it("it can log an info message to the output channel when min level is equal or higher, but not less", function () {
    this.log.start();
    this.log.setMinLevel('info');
    this.log._logger.info = sinon.spy();
    this.log._logger.debug = sinon.spy();
    let message = 'My log message';
    this.log.info(message);
    expect(this.log._logger.info).to.be.calledWithExactly(message);
    expect(this.log._logger.debug).not.to.be.called;
    this.log._logger.info = sinon.spy();
    this.log.setMinLevel('warning');
    this.log.info(message);
    expect(this.log._logger.info).not.to.be.called;
  });

  it.server("it can log a warning message to the output channel when min level is equal or higher, but not less", function () {
    this.log.start();
    this.log.setMinLevel('warning');
    this.log._logger.warning = sinon.spy();
    this.log._logger.info = sinon.spy();
    let message = 'My log message';
    this.log.warning(message);
    expect(this.log._logger.warning).to.be.calledWithExactly(message);
    expect(this.log._logger.info).not.to.be.called;
    this.log._logger.warning = sinon.spy();
    this.log.setMinLevel('error');
    this.log.warning(message);
    expect(this.log._logger.warning).not.to.be.called;
  });

  it.client("it can log a warning message to the output channel when min level is equal or higher, but not less", function () {
    this.log.start();
    this.log.setMinLevel('warning');
    this.log._logger.warn = sinon.spy();
    this.log._logger.info = sinon.spy();
    let message = 'My log message';
    this.log.warning(message);
    expect(this.log._logger.warn).to.be.calledWithExactly(message);
    expect(this.log._logger.info).not.to.be.called;
    this.log._logger.warn = sinon.spy();
    this.log.setMinLevel('error');
    this.log.warning(message);
    expect(this.log._logger.warn).not.to.be.called;
  });

  it("it can log an error message to the output channel when min level is equal", function () {
    this.log.start();
    this.log.setMinLevel('error');
    this.log._logger.error = sinon.spy();
    this.log._logger.info = sinon.spy();
    let message = 'My log message';
    this.log.error(message);
    expect(this.log._logger.error).to.be.calledWithExactly(message);
    expect(this.log._logger.info).not.to.be.called;
    this.log._logger.info = sinon.spy();
    this.log.setMinLevel('debug');
    this.log.error(message);
    expect(this.log._logger.error).to.be.calledWithExactly(message);
  });

  it("allows logging output to be stopped", function () {
    this.log._logger.info = sinon.spy();
    this.log.start();
    expect(this.log._is('running')).to.be.true;
    this.log.stop();
    let message = 'My Log Message';
    this.log.info(message);
    expect(this.log._logger.info).not.to.be.called;
    expect(this.log._is('stopped')).to.be.true;
  });

});
