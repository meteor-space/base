
describe("Space.base - Requiring modules in other modules and apps", function() {

  it("multiple modules should be able to require the same base module", function() {

    Space.Module.define('BaseModule', {
      // Regression test -> this was invoked twice at some point
      afterInitialize: function() {
        this.injector.map('x').to('y');
      }
    });

    Space.Module.define('DependentModule1', { requiredModules: ['BaseModule'] });
    Space.Module.define('DependentModule2', { requiredModules: ['BaseModule'] });

    const MyApp = Space.Application.define('MyApp', {
      requiredModules: ['DependentModule1', 'DependentModule2']
    });

    let appInit = function() { return new MyApp(); };
    expect(appInit).to.not.throw(Error);
  });

});
