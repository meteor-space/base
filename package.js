Package.describe({
  summary: 'Modular application architecture for Meteor.',
  name: 'space:base',
  version: '1.1.0',
  git: 'https://github.com/CodeAdventure/meteor-space.git'
});

Package.onUse(function(api) {

  api.versionsFrom("METEOR@0.9.4");

  api.use([
    'coffeescript',
    'codeadventure:dependance@1.0.0'
  ]);

  api.addFiles([
    'source/namespace.coffee',
    'source/module.coffee',
    'source/application.coffee'
  ]);

});

Package.onTest(function(api) {

  api.use([
    'coffeescript',
    'space:base',

    // test weak-dependencies
    'ejson',
    'accounts-base',
    'email',
    'session',
    'reactive-var',

    'spacejamio:munit@2.0.1',
  ]);

  api.addFiles([
    'tests/unit/module.unit.coffee',
    'tests/unit/application.unit.coffee',
    'tests/integration/application_with_modules.integration.coffee',
    'tests/integration/standalone_application.integration.coffee',
  ]);

});
