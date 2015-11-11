
describe("Space.base - Requiring modules in other modules and apps", function(){

  it("multiple modules should be able to require the same base module", function(){

    Space.Module.define('BaseModule', {
      // Regression test -> this was invoked twice at some point
      afterInitialize: function() {
        this.injector.map('x').to('y');
      }
    });

    Space.Module.define('DependentModule1', { RequiredModules: ['BaseModule'] });
    Space.Module.define('DependentModule2', { RequiredModules: ['BaseModule'] });

    var MyApp = Space.Application.define('MyApp', {
      RequiredModules: ['DependentModule1', 'DependentModule2']
    });

    function appInit() { new MyApp(); }
    expect(appInit).to.not.throw(Error);
  });

});
