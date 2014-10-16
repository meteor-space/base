# Space Application Architecture [![Build Status](https://travis-ci.org/CodeAdventure/meteor-space.svg?branch=master)](https://travis-ci.org/CodeAdventure/meteor-space)

*Space* is a simple but modular application architecture for Meteor.

It allows you to create applications that are based on
small encapsulated modules which follow these rules:

1. No global variables (direct references to other modules) in the code
2. Clear dependencies between modules
3. Reuse as much as possible through other modules

When you build modules with *Space* you always declare other required
modules and the runtime dependencies by putting special properties on
your prototypes:

## Defining Modules
Here is an example using CoffeeScript:

```Coffeescript
class MyModule extends Space.Module

  @publish this, 'MyModule' # publish this module into the Space environment

  # declare which Space modules you require
  RequiredModules: [
    'OtherModule',
    'YetAnotherModule'
  ]

  # declare your injected runtime dependencies
  Dependencies:
    someService: 'OtherModule.SomeService',
    anotherService: 'YetAnotherModule.AnotherService'

  # this method is called by the Space framework after all
  # required modules are initialized and the dependencies
  # are resolved and injected into the instance of this module
  configure: ->

    # add mappings to the global dependency injection system
    @injector.map('MyModule.TestValue').toStaticValue 'test'

    # use required dependencies
    @someService.doSomeMagic()
    @anotherService.beAwesome()
```

## Creating Applications based on Modules
Here is an example using CoffeeScript:

```CoffeeScript
class MyApplication extends Space.Application

  RequiredModules: ['MyModule']

  Dependencies:
    testValue: 'MyModule.TestValue'

  # this is called when all required modules are initialized
  # and configured. Now you can use any dependencies and rule the world.
  configure: -> console.log @testValue
```

## Further Examples
You can look at the tests of this package to see all features that the
Space architecture provides for you.

## Dependency Injection
Space uses the *dependance* package for the dependency injection.
For details of how to declare mappings [read the documentation](http://codeadventure.github.io/meteor-dependance)

## Install
`meteor add space:base`

## Run the tests
`mrt test-packages ./`

## Release History
* 1.0.0 - Publish first version to Meteor package system
* 0.1.0 - Initial release of Space

## License
Copyright (c) 2014 Code Adventure
Licensed under the MIT license.
