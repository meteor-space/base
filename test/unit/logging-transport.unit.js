import LoggingTransport from '../../src/logging-transports/logging-transport.js';
import {expect} from 'chai';
import sinon from 'sinon';

describe(`LoggingTransport`, function() {
  const sb = sinon.sandbox.create();

  const lib = {
    debug: sb.spy(),
    log: sb.spy(),
    info: sb.spy(),
    warning: sb.spy(),
    error: sb.spy()
  };

  afterEach(() => {
    sb.reset();
  });

  it(`allows to pass logging library to super constructor`, () => {
    const setLibrary = sinon.spy(LoggingTransport.prototype, 'setLibrary');
    expect(new LoggingTransport(lib).getLibrary()).to.be.equal(lib);
    expect(setLibrary).to.be.calledOnce;
    expect(setLibrary).to.be.calledWithExactly(lib);
  });

  it(`throws error if logging library is not passed on construction`, () => {
    expect(() => {new LoggingTransport();}).to.throw(
      LoggingTransport.ERRORS.undefinedLibrary
    );
  });

  describe(`accessors`, () => {
    it(`returns underlying logging library`, () => {
      expect(new LoggingTransport(lib).getLibrary()).to.be.equal(lib);
    });
  });

  describe(`mutators`, () => {
    it(`throws error if provided library is undefined or null`, () => {
      const logger = new LoggingTransport(lib);
      expect(() => {logger.setLibrary(undefined);}).to.throw(
        LoggingTransport.ERRORS.invalidLibrary
      );
      expect(() => {logger.setLibrary(null);}).to.throw(
        LoggingTransport.ERRORS.invalidLibrary
      );
    });
    it(`sets logging library`, () => {
      const otherLib = sinon.spy();
      const adapter = new LoggingTransport(lib);
      adapter.setLibrary(otherLib);
      expect(adapter.getLibrary()).to.be.equal(otherLib);
    });
  });

  describe(`logs message as`, () => {
    const message = 'My log message';

    beforeEach(() => {
      this.logger = new LoggingTransport(lib);
    });

    it("debug", () => {
      this.logger.debug(message);
      expect(lib.debug.calledWith(message)).to.be.true;
    });

    it("info", () => {
      this.logger.info(message);
      expect(lib.info.calledWith(message)).to.be.true;
    });

    it("warning", () => {
      this.logger.warning(message);
      expect(lib.warning.calledWith(message)).to.be.true;
    });

    it("error", () => {
      this.logger.error(message);
      expect(lib.error.calledWith(message)).to.be.true;
    });
  });
});
