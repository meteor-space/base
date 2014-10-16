Package.describe({
  summary: 'Modular application architecture for Meteor.',
  name: 'space:base',
  version: '1.0.0'
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
    'spacejamio:munit@2.0.1',
  ]);

  api.addFiles([
    'tests/unit/module.unit.coffee',
    'tests/unit/application.unit.coffee',
    'tests/integration/application_with_modules.integration.coffee',
  ]);

});
