Changelog
=========

### 2.2.0
- Improves `Space.Object.extend` capabilities to work smoothly with Javascript
and provide multiple ways to extend core classes.
- Improves general debugging experience by throwing errors when values can
not be resolved with `Space.resolvePath`
- `Space.resolvePath` now also takes into account published space modules, which
solves the problem of Meteor package scoping.
- adds `Space.Module.define` and `Space.Application.define` which makes it easier
to flesh out modules and apps in Javascript (without having to call `publish`)

### 2.1.0
Introduces lazy auto-mapping of singletons and static values if they are
requested by other parts via the `Dependencies` property. For the first request
it looks up the dependency on the global context and maps functions as singletons
and other values as static. Be aware that some part of the system has to require
your singleton before it ever exists. In some cases this is not what you want
(e.g event handling)

### 2.0.1
@Sanjo fixed an issue with weak-dependencies injection in `Space.Application`.

### 2.0.0
#### Breaking Changes:

- Unified the API for starting `Space.Module` and `Space.Application`. This
means you have to call `yourApp.start()` instead of `yourApp.run()` now.
- Renamed the `run` hook for modules and applications to `startup`, so instead
of defining `run: function() { … }` you need `startup: function() { … }` inside your modules and apps now.

### 1.4.2
Make it possible to declare `Singletons: []` on any module with paths to classes
that should be mapped and created as singletons automatically.  

### 1.4.1
Fixes some package dependency issues

### 1.4.0
Adds basic mixin capabilities to Space.Object that allows to extend
the prototype of a given class without direct inheritance

### 1.3.2
Fixes bug with running dependent modules in correct order.

### 1.3.1
Throw error when trying to map `undefined` or `null` value.

### 1.3.0
Adds helpers specs and fixes edge case bug with resolve path helper

### 1.2.9
Introduces general purpose helpers on the Space namespace

### 1.2.8
Adds global value lookup for injection mapping support: e.g:
`@injector.map('my.awesome.Class').asSingleton()`

### 1.2.7
Support old js engines that without Object.defineProperty support.

### 1.2.6
Fixes bug where `onDependenciesReady` was only called once per prototype

### 1.2.5
Fixes bug where `onDependenciesReady` was called more than once

### 1.2.4
Fixes bug where injected values were overwritten

### 1.2.4
Fixes bug where injected values were overwritten

### 1.2.3
Fixes regression bug where injector didn't inject into values

### 1.2.2
Renames `Space.Class` to `Space.Object`

### 1.2.1
#### Features:
  * Adds support for static constructor functions while extending classes
  * Completes API compatibility to dependance injector

#### Bugfixes:
  * Providers are now added to the `Mapping` prototype, not to every instance.

### 1.2.0
#### Features:
  * Adds `Space.Object` for better Javascript inheritance support
  * Replaces Dependance with brand new (but compatible) `Space.Injector`

### 1.1.0
Added mappings to core Meteor packages

### 1.0.0
Publish first version to Meteor package system

### 0.1.0
Initial release of Space
