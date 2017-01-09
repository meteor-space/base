import Module from '../../source/module.coffee';
import SpaceObject from '../../source/object.coffee';
import {Injector} from '../../source/injector.coffee';

describe("Module - regressions", function() {

  it("ensures autoboot singletons have access to injector mappings made in module onInitialize", function() {

    Test = Space.namespace('Test');

    SomeLib = { libMethod: function() {} };
    let singletonReadySpy = sinon.spy();
    let myInjector = new Injector();

    SpaceObject.extend(Test, 'MySingleton', {
      dependencies: { someLib: 'SomeLib' },
      onDependenciesReady: singletonReadySpy
    });

    Test.MyModule = Module.extend(Test, 'MyModule', {
      singletons: ['Test.MySingleton'],
      onInitialize() { this.injector.map('SomeLib').to(SomeLib); }
    });

    let module = new Test.MyModule();
    module.initialize(module, myInjector);

    expect(singletonReadySpy).to.have.been.called;

  });

});
