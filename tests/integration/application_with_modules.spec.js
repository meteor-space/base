
describe('Building applications based on modules', function() {

  beforeEach(function() {
    Space.Module.published = {}; // reset published space modules
  });

  it('loads required module correctly', function() {

    var testValue = {};
    var testResult = null;

    Space.Module.define('FirstModule', {
      onInitialize: function() {
        this.injector.map('testValue').toStaticValue(testValue);
      }
    });

    Space.Application.create({
      RequiredModules: ['FirstModule'],
      Dependencies: { testValue: 'testValue' },
      onInitialize: function () { testResult = this.testValue; }
    });

    expect(testResult).to.equal(testValue);
  });

  it('configures module before running', function() {

    var moduleValue = 'module configuration';
    var appValue = 'application configuration';
    var testResult = null;

    Space.Module.define('FirstModule', {
      onInitialize: function() {
        this.injector.map('moduleValue').to(moduleValue);
      },
      onStart: function() {
        testResult = this.injector.get('moduleValue');
      }
    });

    var app = Space.Application.create({
      RequiredModules: ['FirstModule'],
      Dependencies: { moduleValue: 'moduleValue' },
      onInitialize: function() {
        this.injector.override('moduleValue').toStaticValue(appValue);
      }
    });

    app.start();
    expect(testResult).to.equal(appValue);
  });
});
