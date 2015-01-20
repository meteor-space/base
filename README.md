# space:base [![Build Status](https://travis-ci.org/CodeAdventure/meteor-space.svg?branch=master)](https://travis-ci.org/CodeAdventure/meteor-space)

**Space** is a modular application architecture for Meteor with the
following goals:

1. Dependencies in your code are explicit
2. You have full control over configuration and initialization
3. Testing your stuff is easy

## Why?
As your Meteor app grows, you add more and more packages and dependencies
to it and sprinkle your configuration and initialization logic into
`Meteor.startup` blocks all over the code base. If you don't use *some*
structure, you will end up throwing your laptop against the wall because
it will become difficult to keep an overview.

## 1. Explicit Dependencies
Space comes with a very lightweight dependency injection system. It tries
to keep your code as clean as possible and doesn't force you to wrap your
functions with library calls.

If an object needs some other code during runtime, it simply declares its
**dependency**:

```javascript
var dependendObject = {
  Dependencies: { lib: 'OtherCode' },
  sayHello: function() { this.lib.sayHello(); }
};
```
*I use a very dense coding style here to keep these examples short*

Now `dependendObject` declares very explicitly that it needs `OtherCode`
which it will access via `this.lib` later on. But where should `OtherCode`
come from?

This is where the `Space.Injector` helps out:

```javascript
var library = { sayHello: function() { console.log('hello!'); } };
var injector = new Space.Injector();

// maps the string identifier 'OtherCode' to the library object
injector.map('OtherCode').to(library);
// injects all dependencies into the dependent object
injector.injectInto(dependendObject);

dependendObject.sayHello(); // logs: 'hello!'
```

Of course, this also works with Javascript constructors and prototypes:

```javascript
var MyClass = function() {};
MyClass.prototype.Dependencies = { lib: 'OtherCode' };
MyClass.prototype.sayHello = function() { this.lib.sayHello() };

var instance = new MyClass();
injector.injectInto(instance);
instance.sayHello(); // logs: 'hello!'
```

This was just first glimpse into dependency injection, there many
other ways to map your code and you can add your own too:

**[Learn more about Space.Injector](https://github.com/CodeAdventure/meteor-space/wiki/Space.Injector)**

### Sidebar: Classes and Instances

In the examples above we used plain Javascript, but Space comes bundled
with a simple but powerful inheritance system:

```javascript
var BaseClass = Space.Object.extend({
  Dependencies: { lib: 'OtherCode' },
  sayHello: function() { this.lib.sayHello(); }
});

var MyClass = BaseClass.extend({
  name: '',
  sayHello: function() {
    BaseClass.prototype.sayHello.call(this);
    console.log('I am ' + this.name);
  }
});

var instance = MyClass.create({ name: 'Dominik' });
injector.injectInto(instance);
instance.sayHello(); // logs: 'hello!' and 'I am Dominik'
```

This was just the very basic example, there are many other features
that help you build awesome classes with Space:

**[Learn more about Space.Object](https://github.com/CodeAdventure/meteor-space/wiki/Space.Object)**

## 2. Control over Configuration and Initialization

Ok, now you declared your dependencies and learned how to inject them.
The next questions is: "Where should the mapping of string identifiers
to actual implementations happen?".

### Applications

Applications are the command center of your code. Here you configure
and initialize all the different pieces:

```javascript
var app = Space.Application.create({

  // This is automatically called on creation
  configure: function () {
    // every app has its own injector by default
    this.injector.map('ExternalLib').to(SomeLibrary);
    this.injector.map('MyDependendClass').toSingleton(MyClass);
  },
  run: function() {
    // Create the singleton instance of my class
    this.injector.create('MyDependendClass');
  }
});

app.run(); // You decide when your app starts to run

```

### Modules

When your application grows, it will become tedious to setup everything
in your main application. It's time to split up your code into modules!

Modules work exactly like applications, in fact `Space.Application`
inherits from `Space.Module`. However they don't create an injector
for themselves, but use the one provided by the (single) application.
This way, all modules within your app share the same injector.

Modules declare which other modules they require and what runtime
dependencies they have, by putting the special properties
`RequiredModules` and `Dependencies` on their prototypes:

```javascript
Space.Module.extend(function() {

  /* Note: We use a static constructor here,
     <this> refers to the extending class and
     this function is only run once when while
     creating the class */

  // Statically register this module in the Space environment
  this.publish(this, 'MyModule');

  // Prototype of the module:
  return {

    // Declare which other Space modules are require
    RequiredModules: [
      'OtherModule',
      'YetAnotherModule'
    ],

    // Declare injected runtime dependencies
    Dependencies: {
      someService: 'OtherModule.SomeService',
      anotherService: 'YetAnotherModule.AnotherService'
    },

    // This method is called by the Space framework after all
    // required modules are initialized and the dependencies
    // are resolved and injected into the instance of this module.
    configure: function() {

      // Add mappings to the shared dependency injection system
      this.injector.map('MyModule.TestValue').to('test');

      // Use required dependencies
      this.someService.doSomeMagic()
      this.anotherService.beAwesome()
    }
  };
```

### Creating Applications based on Modules

```javascript
Space.Application.create({

  // Applications also declare which modules they need:
  RequiredModules: ['MyModule'],

  // And their runtime dependencies from required modules:
  Dependencies: {
    testValue: 'MyModule.TestValue'
  },

  // This is called when all required modules are configured.
  configure: function() {
    console.log(this.testValue); // logs 'test' (see module above)
  }
```

### Requiring Meteor Core Packages
Instead of globally accessing Meteor packages in your codebase
you can add them to your module / application dependencies and
have them injected automatically after initialisation.

#### Example: Packages on Server and Client

```javascript
Space.Application.create({

  Dependencies: {
    meteor: 'Meteor',
    tracker: 'Tracker',
    ejson: 'EJSON',
    ddp: 'DDP',
    accounts: 'Accounts',
    random: 'Random',
    underscore: 'underscore',
    reactiveVar: 'ReactiveVar',
    mongo: 'Mongo'
  },

  configure: function() {
    expect(this.meteor).to.equal(Meteor);
    expect(this.tracker).to.equal(Tracker);
    expect(this.ejson).to.equal(EJSON);
    expect(this.ddp).to.equal(DDP);
    expect(this.accounts).to.equal(Package['accounts-base'].Accounts);
    expect(this.random).to.equal(Random);
    expect(this.underscore).to.equal(_);
    expect(this.reactiveVar).to.be.instanceof(Package['reactive-var'].ReactiveVar);
    expect(this.mongo).to.equal(Mongo);
  }
});
```

#### Example: Packages on Client only

```javascript
Space.Application.create({

  Dependencies: {
    templates: 'Template',
    session: 'Session',
    blaze: 'Blaze',
  },

  configure: function() {
    expect(this.templates).to.equal(Template);
    expect(this.session).to.equal(Session);
    expect(this.blaze).to.equal(Blaze);
  }
});
```

### Example for packages on server only

```javascript
Space.Application.create({

  Dependencies: {
    email: 'Email',
    process: 'process',
    Future: 'Future',
  },

  configure: function() {
    expect(this.email).to.equal(Package['email'].Email);
    expect(this.process).to.equal(process);
    expect(this.Future).to.equal(Npm.require('fibers/future'));
  }
});
```

## Further Examples
Look through the tests of this package to see all
features that `space:base` provides for you.

## Install
`meteor add space:base`

## Run the tests
`mrt test-packages ./`

## Release History
* 1.2.6 - Fixes bug where `onDependenciesReady` was only called once per prototype
* 1.2.5 - Fixes bug where `onDependenciesReady` was called more than once
* 1.2.4 - Fixes bug where injected values were overwritten
* 1.2.3 - Fixes regression bug where injector didn't inject into values
* 1.2.2 - Renames `Space.Class` to `Space.Object`
* 1.2.1 - Completes old injector API compability and fixes some bugs (see [full changelog](https://github.com/CodeAdventure/meteor-space/blob/master/CHANGELOG.md#121))
* 1.2.0 - Added space class system and space injector (see [full changelog](https://github.com/CodeAdventure/meteor-space/blob/master/CHANGELOG.md#120))
* 1.1.0 - Added mappings to core Meteor packages
* 1.0.0 - Publish first version to Meteor package system
* 0.1.0 - Initial release of Space

## License
Copyright (c) 2014 Code Adventure
Licensed under the MIT license.
