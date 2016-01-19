describe("Space.Module - regressions", function() {

  it("ensures autoboot singletons have access to injector mappings made in module onInitialize", function() {

    Test = Space.namespace('Test');
    SomeLib = { libMethod: function() {} };
    let singletonReadySpy = sinon.spy();
    let myInjector = new Space.Injector();

    Space.Object.extend(Test, 'MySingleton', {
      dependencies: { someLib: 'SomeLib' },
      onDependenciesReady: singletonReadySpy
    });

    Test.MyModule = Space.Module.extend(Test, 'MyModule', {
      singletons: ['Test.MySingleton'],
      onInitialize() { this.injector.map('SomeLib').to(SomeLib); }
    });

    let module = new Test.MyModule();
    module.initialize(module, myInjector);

    expect(singletonReadySpy).to.have.been.called;

  });

});
