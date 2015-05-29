![Space Brand Mood](docs/images/space-brand-mood.jpg?raw=true)

# SPACE [![Build Status](https://travis-ci.org/CodeAdventure/meteor-space.svg?branch=master)](https://travis-ci.org/CodeAdventure/meteor-space)

Modular application architecture for Meteor with the following goals:

1. Explicit dependencies in your code
2. Full control over configuration and initialization
3. Testability

## Why?
As your Meteor app grows, you keep adding packages and dependencies
to it and sprinkle your configuration and initialization logic into
`Meteor.startup` blocks all over the code base. If you don't use *some*
structure, you will end up throwing your laptop against the wall.

## 1. Explicit Dependencies
Space comes with a lightweight dependency injection system. It tries
to keep your code as clean as possible and doesn't force you to wrap your
functions with library calls.

If an object needs other code during runtime, it simply declares its
**dependencies**:

```javascript
var dependendObject = {
  Dependencies: {
    lib: 'OtherCode'
  },
  sayHello: function() {
    this.lib.sayHello();
  }
};
```
Now `dependendObject` declares very explicitly that it needs `OtherCode`
which it will access via `this.lib` later on. But where does `OtherCode`
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
*I use a very dense coding style here to keep these examples short*

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
  startup: function() {
    // Create the singleton instance of my class
    this.injector.create('MyDependendClass');
  }
});

app.start(); // You decide when your app starts
```

because singletons are needed so often, there is even a much shorter way
to express the above:

```javascript
var app = Space.Application.create({
  // Let the framework map and create the singleton instances for you
  Singletons: ['MyDependendClass', 'MyOtherSingleton']
});
app.start(); // You decide when your app starts
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
var MyModule = Space.Module.extend({
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
});

// Publish this module to make it available to other modules and/or the app
Space.Module.publish(MyModule, 'MyModule');
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

**[Learn more about Modules and Applications](https://github.com/CodeAdventure/meteor-space/wiki/Space.Injector)**

## 3. Testability

You may ask why you should deal with dependency injection if you can access your dependencies directly like this:

```javascript
var Customer = Space.Object.extend({
  getPurchases: function() {
    return Purchases.find({ customerId: this.id }).fetch();
  }
});
```

This works well, until you write your first unit tests. The problem is that this class 
directly references `Purchases` and there is only one way you can test this (sanely): 

By temporarily replacing `Purchases` globally with some mock/stub

```javascript
describe('Customer.getPurchases'), function() {

  beforeEach(function() {
    // Save a backup of the global Purchases collection
    this.savedPurchasesCollection = Purchases;
    // Replace the collection with an anonymous one
    Purchases = new Mongo.Collection(null);
  })
    
  afterEach(function() {
    // Restore the global purchases collection
    Purchases = this.savedPurchasesCollection;
  })

  it('queries the purchases collection and returns fetched results'), function() {
    // Prepare
    var testPurchase = { _id: '123', productId: 'xyz' };
    Purchases.insert(testPurchase);
    // Test
    var customer = new Customer();
    var purchases = customer.getPurchases();
    expect(purchases).to.deep.equal([testPurchase]);
  })
})
```

In this example it does not look too bad but this pattern quickly becomes tedious if you have more than 1-2 dependencies you want to replace during your tests.

Here is how you can write a test like this when using space:

```javascript
var Customer = Space.Object.extend({
  // Annotate your dependencies
  Dependencies: { purchases: 'Purchases' },
  getPurchases: function() {
    this.purchases.find({ customerId: this.id }).fetch();
  }
});

describe('Customer.getPurchases'), function() {

  beforeEach(function() {
    // Inject the dependency directly on creation
    this.customer = new Customer({ purchases: new Mongo.Collection(null) });
  })

  it 'queries the purchases collection and returns fetched results', function() {
    // Prepare
    testPurchase = { _id: '123', productId: 'xyz' };
    this.customer.purchases.insert(testPurchase);
    // Test
    var purchases = customer.getPurchases();
    expect(purchases).to.deep.equal([testPurchase]);
  })
})
```

Since the `Dependencies` property is just a simple prototype annotation that has no meaning outside
the Space framework, you can just inject the dependencies yourself during the tests. This
pattern works great, because your code remains completely framework agnostic (you could
replace Space by any other DI framework or do it yourself). The positive side effect is that you
explicitely declare your dependencies now. This helps you keep an eye on the complexity and coupling.
If you realize that a class has more than 5 dependencies, it might be a good indicator that it is
doing too much.

## Further Examples
Look through the tests of this package to see all
features that `space:base` provides for you.

## Install
`meteor add space:base`

## Run the tests
`mrt test-packages ./`

## Release History
You find all release changes in the [changelog](https://github.com/CodeAdventure/meteor-space/blob/master/CHANGELOG.md)

## License
Copyright (c) 2015 Code Adventure
Licensed under the MIT license.
