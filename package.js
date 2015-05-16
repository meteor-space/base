Package.describe({
  summary: 'Modular application architecture for Meteor.',
  name: 'space:base',
  version: '1.4.3',
  git: 'https://github.com/CodeAdventure/meteor-space.git'
});

Package.onUse(function(api) {

  api.versionsFrom("METEOR@1.0");

  api.use([
    'coffeescript',
    'check',
    'underscore'
  ]);

  api.use([
    'ejson',
    'ddp',
    'random',
    'mongo',
    'tracker',
    'templating',
    'session',
    'blaze',
    'email',
    'accounts-base',
    'reactive-var'
  ], {weak: true});

  api.addFiles([
    'source/namespace.coffee',
    'source/helpers.coffee',
    'source/object.coffee',
    'source/struct.coffee',
    'source/injector.coffee',
    'source/module.coffee',
    'source/application.coffee'
  ]);

});

Package.onTest(function(api) {

  api.use([
    'coffeescript',
    'check',
    'space:base',

    // weak-dependencies
    'ejson',
    'accounts-base',
    'email',
    'session',
    'reactive-var',

    'practicalmeteor:munit@2.0.2',
    'space:testing@1.3.0',
  ]);

  api.addFiles([

    // unit tests
    'tests/unit/object.unit.coffee',
    'tests/unit/module.unit.coffee',
    'tests/unit/struct.unit.coffee',
    'tests/unit/application.unit.coffee',
    'tests/unit/injector.unit.coffee',
    'tests/unit/helpers.unit.coffee',

    // integration tests
    'tests/integration/application_with_modules.spec.js',
    'tests/integration/standalone_application.integration.coffee',
  ]);

});
