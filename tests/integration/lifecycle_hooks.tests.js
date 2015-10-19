describe("Space.base - Application lifecycle hooks", function () {

  beforeEach(function () {
    // reset published space modules
    Space.Module.published = {};
    // Setup lifecycle hooks with sinon spys
    this.firstHooks = createLifeCycleHookSpies();
    this.secondHooks = createLifeCycleHookSpies();
    this.appHooks = createLifeCycleHookSpies();
    // Create a app setup with two modules and use the spied apon hooks
    Space.Module.define('First', this.firstHooks);
    Space.Module.define('Second', _.extend(this.secondHooks, { RequiredModules: ['First'] }));
    this.app = Space.Application.create(_.extend(this.appHooks, { RequiredModules: ['Second'] }));
  });

  it("runs the initialize hooks in correct order", function () {
    testOrderOfLifecycleHook(this, 'beforeInitialize', 'onInitialize', 'afterInitialize');
  });

  it("runs the start hooks in correct order", function () {
    expectHooksNotCalledYet(this, 'beforeStart', 'onStart', 'afterStart');
    this.app.start();
    testOrderOfLifecycleHook(this, 'beforeStart', 'onStart', 'afterStart');
  });

  it("runs the reset hooks in correct order", function () {
    expectHooksNotCalledYet(this, 'beforeReset', 'onReset', 'afterReset');
    this.app.reset();
    testOrderOfLifecycleHook(this, 'beforeReset', 'onReset', 'afterReset');
  });

  it("runs the stop hooks in correct order", function () {
    expectHooksNotCalledYet(this, 'beforeStop', 'onStop', 'afterStop');
    this.app.stop();
    testOrderOfLifecycleHook(this, 'beforeStop', 'onStop', 'afterStop');
  });

  // TEST HELPERS

  function addHookSpy(hooks, hookName) {
    hooks[hookName] = function() {};
    sinon.spy(hooks, hookName);
  }

  function createLifeCycleHookSpies() {
    hooks = {};
    hookNames = [
      'beforeInitialize', 'onInitialize', 'afterInitialize', 'beforeStart', 'onStart',
      'afterStart', 'beforeReset', 'onReset', 'afterReset', 'beforeStop', 'onStop', 'afterStop'
    ];
    for(var i=0; i<hookNames.length; i++) {
      addHookSpy(hooks, hookNames[i]);
    }
    return hooks;
  }

  function testOrderOfLifecycleHook(context, before, on, after) {
    modules = ['firstHooks', 'secondHooks', 'appHooks'];
    hooks = [before, on, after];
    for(var i=0; i < 3; i++) {
      for(var j=0; j < 3; j++) {
        expect(context[modules[i]][hooks[j]]).to.have.been.calledOnce;
        if(i < 2) {
          expect(context[modules[i]][hooks[j]]).to.have.been.calledBefore(context[modules[i+1]][hooks[j]]);
        }
      }
    }
  }

  function expectHooksNotCalledYet(context, before, on, after) {
    modules = ['firstHooks', 'secondHooks', 'appHooks'];
    hooks = [before, on, after];
    for(var i=0; i < 3; i++) {
      for(var j=0; j < 3; j++) {
        expect(context[modules[i]][hooks[j]]).not.to.have.been.called;
      }
    }
  }
});
