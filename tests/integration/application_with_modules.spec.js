
describe('Building applications based on modules', function() {

  afterEach(function() {
    Space.Module.published = {}; // reset published space modules
  });

  it('loads required module correctly', function() {

    var testValue = {};
    var testResult = null;

    Space.Module.extend(function() {
      this.publish(this, 'FirstModule');
      return {
        configure: function() {
          this.injector.map('testValue').toStaticValue(testValue);
        }
      }
    });

    Space.Application.create({
      RequiredModules: ['FirstModule'],
      Dependencies: { testValue: 'testValue' },
      configure: function () { testResult = this.testValue; }
    });

    expect(testResult).to.equal(testValue);
  });

  it('configures module before running', function() {

    var moduleValue = 'module configuration';
    var appValue = 'application configuration';
    var testResult = null

    Space.Module.extend(function() {

      this.publish(this, 'FirstModule');

      return {
        configure: function() {
          this.injector.map('moduleValue').to(moduleValue);
        },
        run: function() {
          testResult = this.injector.get('moduleValue');
        }
      };
    });

    var app = Space.Application.create({
      RequiredModules: ['FirstModule'],
      Dependencies: { moduleValue: 'moduleValue' },
      configure: function() {
        this.injector.override('moduleValue').toStaticValue(appValue);
      }
    });

    app.run()
    expect(testResult).to.equal(appValue)
  });
});
