
describe 'Building applications based on modules', ->

  # reset published space modules
  afterEach -> Space.Module.published = {}

  it 'loads required module correctly', ->

    testValue = {}
    testResult = null

    class FirstModule extends Space.Module
      @publish this, 'FirstModule'
      configure: -> @injector.map('testValue').toStaticValue testValue

    App = Space.Application.extend
      RequiredModules: ['FirstModule']
      Dependencies: testValue: 'testValue'
      configure: -> testResult = @testValue

    new App()

    expect(testResult).to.equal testValue

  it 'configures module before running', ->

    moduleValue = 'module configuration'
    appValue = 'application configuration'

    testResult = null

    class FirstModule extends Space.Module
      @publish this, 'FirstModule'
      configure: -> @injector.map('moduleValue').toStaticValue moduleValue
      run: -> testResult = @injector.get 'moduleValue'

    class Application extends Space.Application

      RequiredModules: ['FirstModule']
      Dependencies:
        moduleValue: 'moduleValue'
      configure: -> @injector.override('moduleValue').toStaticValue appValue

    app = new Application()
    app.run()

    expect(testResult).to.equal appValue
