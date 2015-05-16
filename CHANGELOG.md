Changelog
=========

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
