Changelog
=========

### 1.2.7
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
