Space.Logger.Adapter.extend('TestAdapter', {
  Constructor(lib) {
    return this.setLib(lib);
  },
});

describe("Space.Logger", () => {

  beforeEach(() => {
    this.testLib = {
      debug: sinon.spy(),
      info: sinon.spy(),
      warning: sinon.spy(),
      error: sinon.spy()
    };
    this.testAdapter = new TestAdapter(this.testLib);
    this.log = new Space.Logger();
  });

  it('extends Space.Object', () => {
    expect(Space.Logger).to.extend(Space.Object);
  });

  it("is available of both client and server", () => {
    if (Meteor.isServer || Meteor.isClient)
      expect(this.log).to.be.instanceOf(Space.Logger);
  });

  describe('adapters', () => {
    it('throws error if adding adapter without string id', () => {
      const adapter = new TestAdapter(sinon.spy());

      const addAdapter = () => this.log.addAdapter(undefined, adapter);
      expect(addAdapter).to.throw(Error);
    });

    it('throws error if adding adapter with non-string id', () => {
      const adapter = new TestAdapter(sinon.spy());

      const addAdapter = () => this.log.addAdapter(adapter);
      expect(addAdapter).to.throw(Error);
    });

    it('throws error if adding would override adapter', () => {
      const adapterId = 'testAdapter';
      const adapter = new TestAdapter(sinon.spy());

      this.log.addAdapter(adapterId, adapter);
      const overrideAdapter = () => this.log.addAdapter(adapterId, adapter);
      expect(overrideAdapter).to.throw(
        Space.Logger.prototype.ERRORS.mappingExists(adapterId)
      );
    });

    it('throws error if adding adapter without string id', () => {
      const adapter = new TestAdapter(sinon.spy());

      const addAdapter = () => this.log.addAdapter(undefined, adapter);
      expect(addAdapter).to.throw(Error);
    });

    it('adds adapter', () => {
      const adapterId = 'testAdapter';
      const adapter = new TestAdapter(sinon.spy());

      this.log.addAdapter(adapterId, adapter);
      expect(this.log.adapter(adapterId)).to.equal(adapter);
      expect(this.log.existsAdapter(adapterId)).to.be.true;
    });

    it('overrides adapter', () => {
      const adapterId = 'testAdapter';
      const adapter = new TestAdapter(sinon.spy());
      const overridingAdapter = new TestAdapter(sinon.spy());

      this.log.addAdapter(adapterId, adapter);
      const overrideAdapter = () => {
        this.log.overrideAdapter(adapterId, overridingAdapter);
      };
      expect(overrideAdapter).to.not.throw(Error);
      expect(this.log.adapter(adapterId)).to.equal(overridingAdapter);
    });

    it('resolves adapter by id', () => {
      consoleAdapter = new TestAdapter(sinon.spy());
      fileAdapter = new TestAdapter(sinon.spy());

      this.log.addAdapter('console', consoleAdapter);
      this.log.addAdapter('file', fileAdapter);
      expect(this.log.adapter('console')).to.equal(consoleAdapter);
      expect(this.log.adapter('file')).to.equal(fileAdapter);
      expect(this.log.adapter('totallyNotFakeAdapter')).to.be.null;
    });

    it('removes adapter', () => {
      const adapterId = 'testAdapter';
      const adapter = new TestAdapter(sinon.spy());

      this.log.addAdapter(adapterId, adapter);
      this.log.removeAdapter(adapterId);
      expect(this.log.adapter(adapterId)).to.be.null;
      expect(this.log.existsAdapter(adapterId)).to.be.false;
    });

    it('returns adapters', () => {
      const adapters = {
        console: new TestAdapter(sinon.spy()),
        file: new TestAdapter(sinon.spy())
      };
      this.log.addAdapter('console', adapters.console);
      this.log.addAdapter('file',  adapters.file);
      expect(this.log.adapters()).to.include(adapters);
    });
  });

  it("only logs after starting", () => {
    this.log.addAdapter('test', this.testAdapter);
    const message = 'My log message';

    expect(this.log.isRunning()).to.be.false;
    expect(this.log.isStopped()).to.be.true;
    this.log.info(message);
    expect(this.testLib.info.calledWith(message)).to.not.true;

    this.log.start();
    expect(this.log.isRunning()).to.be.true;
    expect(this.log.isStopped()).to.be.false;
    this.log.info(message);
    expect(this.testLib.info.calledWith(message)).to.be.true;
  });

  it("allows logging output to be stopped", () => {
    this.log.addAdapter('test', this.testAdapter);
    const message = 'My log message';

    expect(this.log.isRunning()).to.be.false;
    expect(this.log.isStopped()).to.be.true;
    this.log.start();
    expect(this.log.isRunning()).to.be.true;
    expect(this.log.isStopped()).to.be.false;
    this.log.info(message);
    expect(this.testLib.info.calledWith(message)).to.be.true;

    this.log.stop();
    expect(this.log.isRunning()).to.be.false;
    expect(this.log.isStopped()).to.be.true;

    this.log.info(message);
    expect(this.testLib.info).to.not.be.calledTwice;
  });

  describe('logging', () => {
    it('allows multiple logging adapters to log same message', () => {
      const firstLib = {debug: sinon.spy()};
      const firstAdapter = new TestAdapter(firstLib);
      const secondLib = {debug: sinon.spy()};
      const secondAdapter = new TestAdapter(secondLib);
      const message = 'My log message';

      this.log.addAdapter('first', firstAdapter);
      this.log.addAdapter('second', secondAdapter);
      this.log.start();

      this.log.debug(message);
      expect(firstLib.debug.calledWith(message)).to.be.true;
      expect(secondLib.debug.calledWith(message)).to.be.true;
    });

    describe('logs message as', () => {
      it("debug", () => {
        this.log.addAdapter('test', this.testAdapter);
        this.log.start();

        const message = 'My log message';
        this.log.debug(message);
        expect(this.testLib.debug.calledWith(message)).to.be.true;
      });

      it("info", () => {
        this.log.addAdapter('test', this.testAdapter);
        this.log.start();

        const message = 'My log message';
        this.log.info(message);
        expect(this.testLib.info.calledWith(message)).to.be.true;
      });

      it("warning", () => {
        this.log.addAdapter('test', this.testAdapter);
        this.log.start();

        const message = 'My log message';
        this.log.warning(message);
        expect(this.testLib.warning.calledWith(message)).to.be.true;
      });

      it("error", () => {
        this.log.addAdapter('test', this.testAdapter);
        this.log.start();

        const message = 'My log message';
        this.log.error(message);
        expect(this.testLib.error.calledWith(message)).to.be.true;
      });
    });
  });
});
