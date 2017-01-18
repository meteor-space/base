import ConsoleTransport from '../../src/logging-transports/console-transport.js';
import LoggingTransport from '../../src/logging-transports/logging-transport.js';
import {expect} from 'chai';
import sinon from 'sinon';

describe(`ConsoleTransport`, function() {
  const sb = sinon.sandbox.create();

  beforeEach(() => {
    this.console = {
      debug: sb.spy(),
      log: sb.spy(),
      info: sb.spy(),
      warn: sb.spy(),
      error: sb.spy()
    };
  });

  afterEach(() => {
    sb.reset();
  });

  it(`extends LoggingTransport`, () => {
    expect(ConsoleTransport).to.extend(LoggingTransport);
  });

  it(`sets console as library`, () => {
    expect(new ConsoleTransport().getLibrary()).to.be.equal(console);
  });

  describe(`logs message as`, () => {
    const message = 'My log message';

    beforeEach(() => {
      this.logger = new ConsoleTransport();
      this.logger.setLibrary(this.console);
    });

    it("debug", () => {
      this.logger.debug(message);
      expect(this.console.debug.calledWith(message)).to.be.true;
    });

    it("debug on Node.js", () => {
      delete this.console.debug; // console.debug is unavailable on Node.js

      this.logger.debug(message);
      expect(this.console.log.calledWith(message)).to.be.true;
    });

    it("info", () => {
      this.logger.info(message);
      expect(this.console.info.calledWith(message)).to.be.true;
    });

    it("warning", () => {
      this.logger.warning(message);
      expect(this.console.warn.calledWith(message)).to.be.true;
    });

    it("error", () => {
      this.logger.error(message);
      expect(this.console.error.calledWith(message)).to.be.true;
    });
  });
});
