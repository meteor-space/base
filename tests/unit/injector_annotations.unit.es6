describe('Space.Injector annotations', function() {

  describe('Dependency annotation', function() {

    it('adds the dependency to the dependencies map', function() {
      @Space.Dependency('propertyName1', 'dependencyName1')
      @Space.Dependency('propertyName2', 'dependencyName2')
      class FixtureClass {}

      expect(FixtureClass.prototype.dependencies).to.deep.equal({
        'propertyName1': 'dependencyName1',
        'propertyName2': 'dependencyName2'
      });
    });
  });

  describe('RequireModule annotation', function() {

    it('adds the required module to the requiredModules array', function() {
      @Space.RequireModule('fooModule1')
      @Space.RequireModule('fooModule2')
      class FixtureClass {}

      expect(FixtureClass.prototype.requiredModules).to.contain('fooModule1');
      expect(FixtureClass.prototype.requiredModules).to.contain('fooModule2');
    });

  });

});
