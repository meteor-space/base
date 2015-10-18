Package.describe({
  summary: 'Modular Application Architecture for Meteor.',
  name: 'space:base',
  version: '3.0.0',
  git: 'https://github.com/meteor-space/base.git'
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
    'source/lib/underscore_deep_extend_mixin.js',
    'source/helpers.coffee',
    'source/object.coffee',
    'source/struct.coffee',
    'source/injector.coffee',
    'source/injector_annotations.coffee',
    'source/module.coffee',
    'source/application.coffee'
  ]);

});

Package.onTest(function(api) {

  api.use([
    'meteor',
    'coffeescript',
    'check',
    'space:base',

    // weak-dependencies
    'ddp',
    'random',
    'underscore',
    'mongo',
    'tracker',
    'templating',
    'ejson',
    'accounts-base',
    'email',
    'session',
    'reactive-var',

    'grigio:babel@0.1.3',
    'practicalmeteor:munit@2.1.5',
    'space:testing@1.5.0',
  ]);

  api.addFiles([

    // unit tests
    'tests/unit/object.unit.coffee',
    'tests/unit/module.unit.coffee',
    'tests/unit/struct.unit.coffee',
    'tests/unit/application.unit.coffee',
    'tests/unit/injector.unit.coffee',
    'tests/unit/injector_annotations.unit.es6',
    'tests/unit/helpers.unit.coffee',

    // integration tests
    'tests/integration/application_with_modules.spec.js',
    'tests/integration/standalone_application.integration.coffee',
    'tests/integration/lifecycle_hooks.tests.js',
  ]);

});
