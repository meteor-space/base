import Logger from '../../src/logger.js';
import LoggingTransport from '../../src/logging-transports/logging-transport.js';
import {expect} from 'chai';
import sinon from 'sinon';

class MyTransport extends LoggingTransport {
  constructor(lib) {
    super(lib);
  }
}

describe("Logger", function() {

  beforeEach(() => {
    this.sb = sinon.sandbox.create();
    this.lib = {
      debug: this.sb.spy(),
      info: this.sb.spy(),
      warning: this.sb.spy(),
      error: this.sb.spy()
    };
  });

  afterEach(() => {
    this.sb.reset();
  });

  describe(`contruction`, () => {
    it(`sets logging state to stopped after construction`, () => {
      const logger = new Logger();
      expect(logger.hasState('stopped'));
    });

    it(`initializes adpaters as empty obejct`, () => {
      const logger = new Logger();
      expect(logger.getMappings()).to.be.eql({});
    });
  });

  describe(`logging`, () => {
    it(`allows to start logging`, () => {
      const logger = new Logger();
      logger.start();
      logger.stop();

      expect(logger.hasState('stopped'));
    });

    it(`allows to stop logging`, () => {
      const logger = new Logger();
      logger.stop();
      logger.start();

      expect(logger.hasState('running'));
    });
  });

  describe(`evaluation`, () => {
    it(`returns true if logger in in running state`, () => {
      const logger = new Logger();
      logger.start();
      expect(logger.hasState('running')).to.be.true;
    });

    it(`returns false if logger is not in running state`, () => {
      expect(new Logger().hasState('running')).to.be.false;
    });
  });

  describe(`transports`, () => {
    it('throws match error if id is not a string', () => {
      const transport = new MyTransport(sinon.spy());
      expect(() => new Logger().addTransport(undefined, transport)).to.throw(
        Logger.ERRORS.invalidId
      );
    });

    it('throws match error if id is omitted when adding transport', () => {
      const transport = new MyTransport(sinon.spy());
      expect(() => new Logger().addTransport(transport)).to.throw(
        Logger.ERRORS.invalidId
      );
    });

    it('throws error if transport would be overridden', () => {
      const id = 'my-transport';
      const transport = new MyTransport(sinon.spy());

      const logger = new Logger();
      logger.addTransport(id, transport);
      expect(() => logger.addTransport(id, transport)).to.throw(
        Logger.ERRORS.mappingExists(id)
      );
    });

    it('adds transport', () => {
      const id = 'my-transport';
      const transport = new MyTransport(sinon.spy());

      const logger = new Logger();
      logger.addTransport(id, transport);
      expect(logger.getTransport(id)).to.equal(transport);
      expect(logger.hasTransport(id)).to.be.true;
    });

    it('allows to override transport', () => {
      const id = 'my-transport';
      const transport = new MyTransport(sinon.spy());
      const otherTransport = new MyTransport(sinon.spy());

      const logger = new Logger();
      logger.addTransport(id, transport);
      expect(() => {
        logger.overrideTransport(id, otherTransport);
      }).to.not.throw(Error);
      expect(logger.getTransport(id)).to.equal(otherTransport);
    });

    it('resolves transport by id', () => {
      const consoleTransport = new MyTransport(sinon.spy());
      const fileTransport = new MyTransport(sinon.spy());

      const logger = new Logger();
      logger.addTransport('console', consoleTransport);
      logger.addTransport('file', fileTransport);
      expect(logger.getTransport('console')).to.equal(consoleTransport);
      expect(logger.getTransport('file')).to.equal(fileTransport);
      expect(logger.getTransport('non-existing-transport')).to.be.undefined;
    });

    it('removes transport', () => {
      const id = 'my-transport';
      const transport = new MyTransport(sinon.spy());

      const logger = new Logger();
      logger.addTransport(id, transport);
      logger.removeTransport(id);
      expect(logger.getTransport(id)).to.be.undefined;
      expect(logger.hasTransport(id)).to.be.false;
    });

    it(`returns true if logger has an transport added`, () => {
      const id = 'my-transport';
      const logger = new Logger();
      logger.addTransport(id, new MyTransport(sinon.spy()));
      expect(logger.hasTransport(id)).to.be.true;
    });

    it(`returns false transport is not added to logger`, () => {
      const id = 'my-transport';
      const logger = new Logger();
      expect(logger.hasTransport(id)).to.be.false;
    });

    it('returns transports', () => {
      const transports = {
        console: new MyTransport(sinon.spy()),
        file: new MyTransport(sinon.spy())
      };

      const logger = new Logger();
      logger.addTransport('console', transports.console);
      logger.addTransport('file',  transports.file);
      expect(logger.getTransports()).to.have.members([
        transports.console, transports.file
      ]);
    });

    it(`returns all mappings as an object`, () => {
      const transports = {
        console: new MyTransport(sinon.spy()),
        file: new MyTransport(sinon.spy())
      };

      const logger = new Logger();
      logger.addTransport('console', transports.console);
      logger.addTransport('file',  transports.file);
      expect(logger.getMappings()).to.be.eql(transports);
    });
  });

  it("only logs after starting", () => {
    const logger = new Logger();
    logger.addTransport('my-logger', new MyTransport(this.lib));
    const message = 'My log message';

    expect(logger.isRunning()).to.be.false;
    expect(logger.isStopped()).to.be.true;
    logger.info(message);
    expect(this.lib.info).to.not.be.called;

    logger.start();
    expect(logger.isRunning()).to.be.true;
    expect(logger.isStopped()).to.be.false;
    logger.info(message);
    expect(this.lib.info).to.be.calledOnce;
    expect(this.lib.info.calledWith(message)).to.be.true;
  });

  it("allows logging output to be stopped", () => {
    const logger = new Logger();
    logger.addTransport('my-logger', new MyTransport(this.lib));
    const message = 'My log message';

    expect(logger.isRunning()).to.be.false;
    expect(logger.isStopped()).to.be.true;
    logger.start();
    expect(logger.isRunning()).to.be.true;
    expect(logger.isStopped()).to.be.false;
    logger.info(message);
    expect(this.lib.info.calledWith(message)).to.be.true;

    logger.stop();
    expect(logger.isRunning()).to.be.false;
    expect(logger.isStopped()).to.be.true;

    logger.info(message);
    expect(this.lib.info).to.not.be.calledTwice;
  });

  describe('logging', () => {
    it('allows multiple logging transports to log same message', () => {
      const firstLib = {debug: sinon.spy()};
      const firstTransport = new MyTransport(firstLib);
      const secondLib = {debug: sinon.spy()};
      const secondTransport = new MyTransport(secondLib);
      const message = 'My log message';

      const logger = new Logger();
      logger.addTransport('first', firstTransport);
      logger.addTransport('second', secondTransport);
      logger.start();

      logger.debug(message);
      expect(firstLib.debug.calledWith(message)).to.be.true;
      expect(firstLib.debug).to.be.calledOnce;
      expect(secondLib.debug.calledWith(message)).to.be.true;
      expect(secondLib.debug).to.be.calledOnce;
    });

    describe('logs message as', () => {
      it("debug", () => {
        const logger = new Logger();
        logger.addTransport('my-logger', new MyTransport(this.lib));
        logger.start();

        const message = 'My log message';
        logger.debug(message);
        expect(this.lib.debug.calledWith(message)).to.be.true;
      });

      it("info", () => {
        const logger = new Logger();
        logger.addTransport('my-logger', new MyTransport(this.lib));
        logger.start();

        const message = 'My log message';
        logger.info(message);
        expect(this.lib.info.calledWith(message)).to.be.true;
      });

      it("warning", () => {
        const logger = new Logger();
        logger.addTransport('my-logger', new MyTransport(this.lib));
        logger.start();

        const message = 'My log message';
        logger.warning(message);
        expect(this.lib.warning.calledWith(message)).to.be.true;
      });

      it("error", () => {
        const logger = new Logger();
        logger.addTransport('my-logger', new MyTransport(this.lib));
        logger.start();

        const message = 'My log message';
        logger.error(message);
        expect(this.lib.error.calledWith(message)).to.be.true;
      });
    });
  });
});
