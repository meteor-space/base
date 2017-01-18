import Module from '../../src/module.js';
import App from '../../src/app.js';
import {expect} from 'chai';

describe('Building applications based on modules', function() {


  it('loads required module correctly', function() {

    let testValue = {};
    let testResult = null;

    class FirstModule extends Module {
      onInitialize() {
        this.injector.map('testValue').to(testValue);
      }
    }

    new App({
      dependencies: {testValue: 'testValue'},
      modules: [new FirstModule()],
      onInitialize: function() { testResult = this.testValue; }
    });

    expect(testResult).to.equal(testValue);
  });

  it('configures module before running', function() {

    const moduleValue = 'module configuration';
    const appValue = 'application configuration';
    let testResult = null;

    class FirstModule extends Module {
      onInitialize() {
        this.injector.map('moduleValue').to(moduleValue);
      }
      onStart() {
        testResult = this.injector.get('moduleValue');
      }
    }

    const app = new App({
      modules: [new FirstModule()],
      dependencies: { moduleValue: 'moduleValue' },
      onInitialize: function() {
        this.injector.override('moduleValue').toStaticValue(appValue);
      }
    });

    app.start();
    expect(testResult).to.equal(appValue);
  });
});
