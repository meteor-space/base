Package.describe({
  summary: 'Modular Application Architecture for Meteor.',
  name: 'space:base',
  version: '4.1.4',
  git: 'https://github.com/meteor-space/base.git',
  documentation: 'README.md'
});

Npm.depends({
  "babel-plugin-transform-decorators-legacy": "1.3.4"
});

Package.onUse(function(api) {

  api.versionsFrom('1.4.2');

  api.use([
    'coffeescript',
    'ecmascript'
  ]);

  api.addFiles([
    'source/lib/underscore-deep-extend-mixin.js',
    'source/space.js',
    'source/configuration.js',
    'source/object.coffee',
    'source/logger.js',
    'source/struct.coffee',
    'source/error.js',
    'source/injector.js',
    'source/injector-annotations.js',
    'source/module.js',
    'source/application.js',
    'source/loggers/adapter.js',
    'source/loggers/console-adapter.js',
    'source/index.js',
    'source/meteor.js'
  ]);

  // Test helpers
  api.addFiles([
    'source/testing/bdd-api.js'
  ]);

  api.export([
    'SpaceObject',
    'Struct',
    'SpaceError',
    'Injector',
    'InjectionError',
    'Logger',
    'LoggingAdapter',
    'ConsoleLogger',
    'Module',
    'Application',
    'Space'
  ]);
});

Package.onTest(function(api) {

  api.use([
    'coffeescript',
    'ecmascript',
    'space:base',

    // weak-dependencies
    'practicalmeteor:munit@2.1.5',
    'space:testing@3.0.1'
  ]);

  api.addFiles([

    // unit tests
    'tests/unit/object.unit.coffee',
    'tests/unit/module.unit.coffee',
    'tests/unit/struct.unit.coffee',
    'tests/unit/application.unit.coffee',
    'tests/unit/injector.unit.coffee',
    'tests/unit/injector_annotations.unit.js',
    'tests/unit/helpers.unit.coffee',
    'tests/unit/error.tests.js',
    'tests/unit/logger.tests.js',

    // integration tests
    'tests/integration/application_with_modules.spec.js',
    'tests/integration/lifecycle_hooks.tests.js',
    'tests/integration/requiring-modules.tests.js',
    'tests/integration/module.regressions.js'
  ]);
});
