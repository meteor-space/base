import Module from '../../src/module.js';
import App from '../../src/app.js';
import {expect} from 'chai';

describe("Requiring modules in other modules and apps", function() {

  it("multiple modules should be able to require the same base module", function() {

    class BaseModule extends Module {
      // Regression test -> this was invoked twice at some point
      afterInitialize() {
        this.injector.map('x').to('y');
      }
    }

    class DependentModule1 extends Module {
      modules = [new BaseModule()]
    }
    class DependentModule2 extends Module {
      modules = [new BaseModule()]
    }

    class MyApp extends App {
      modules = [new DependentModule1(), new DependentModule2()]
    }

    const appInit = function() {return new MyApp();};
    expect(() => {appInit();}).to.not.throw(Error);
  });

});
