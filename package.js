Package.describe({
  summary: 'Modular application architecture for Meteor.'
});

Package.on_use(function(api) {

  // on client and server
  api.use([
    'coffeescript',
    'dependance'
  ]);

  api.add_files([

    // core classes
    'source/space.coffee',
    'source/module.coffee',
    'source/application.coffee'

  ]);

});

Package.on_test(function(api) {

  api.use([
    'coffeescript',
    'munit',
    'chai',
    'sinon',
    'space'
  ]);

  api.add_files([
    'tests/integration/application_with_modules.integration.coffee',
    'tests/unit/module.unit.coffee',
    'tests/unit/application.unit.coffee'
  ]);

});
