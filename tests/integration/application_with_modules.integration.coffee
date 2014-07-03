
Munit.run

  name: 'Space'

  tests: [

    {
      name: 'Application loads required module correctly'

      func: (test) ->

        testValue = {}
        testResult = null

        class FirstModule extends Space.Module

          @publish this, 'FirstModule'

          configure: -> @injector.map('testValue').toStaticValue testValue

        class Application extends Space.Application

          RequiredModules: ['FirstModule']

          Dependencies: testValue: 'testValue'

          configure: -> testResult = @testValue

        app = new Application()

        expect(testResult).to.equal testValue
    }

    {
      name: 'Modules can be configured before running the application'

      func: (test) ->

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
    }
  ]

  tearDown: ->
    # reset published space modules
    Space.Module.published = {}
