import {expect} from 'chai';
import Struct from '../../src/struct.js';
import SpaceError from '../../src/error.js';
import {Injector, InjectionError, Provider} from '../../src/injector.js';
import Logger from '../../src/logger.js';
import LoggingTransport from '../../src/logging-transports/logging-transport.js';
import ConsoleTransport from '../../src/logging-transports/console-transport.js';
import Module from '../../src/module.js';
import App from '../../src/app.js';
import helpers from '../../src/helpers';
import dependencies from '../../src/decorators/dependencies-decorator.js';

import {
  Struct as StructExported,
  SpaceError as SpaceErrorExported,
  Injector as InjectorExported,
  InjectionError as InjectionErrorExported,
  Provider as ProviderExported,
  Logger as LoggerExported,
  LoggingTransport as LoggingTransportExported,
  ConsoleTransport as ConsoleTransportExported,
  Module as ModuleExported,
  App as AppExported,
  helpers as helpersExported,
  dependencies as dependenciesExported,
  Space
} from '../../src/index.js';

describe(`exports`, function() {
  it(`Struct`, () => {
    expect(StructExported).to.be.equal(Struct);
  });

  it(`SpaceError`, () => {
    expect(SpaceErrorExported).to.be.equal(SpaceError);
  });

  it(`Injector`, () => {
    expect(InjectorExported).to.be.equal(Injector);
  });

  it(`InjectionError`, () => {
    expect(InjectionErrorExported).to.be.equal(InjectionError);
  });

  it(`Provider`, () => {
    expect(ProviderExported).to.be.equal(Provider);
  });

  it(`Logger`, () => {
    expect(LoggerExported).to.be.equal(Logger);
  });

  it(`LoggingTransport`, () => {
    expect(LoggingTransportExported).to.be.equal(LoggingTransport);
  });

  it(`ConsoleTransport`, () => {
    expect(ConsoleTransportExported).to.be.equal(ConsoleTransport);
  });

  it(`Module`, () => {
    expect(ModuleExported).to.be.equal(Module);
  });

  it(`App`, () => {
    expect(AppExported).to.be.equal(App);
  });

  it(`helpers`, () => {
    expect(helpersExported).to.be.equal(helpers);
  });

  it(`dependencies`, () => {
    expect(dependenciesExported).to.be.equal(dependencies);
  });

  it(`Space`, () => {
    expect(Space.Struct).to.be.equal(Struct);
    expect(Space.Error).to.be.equal(SpaceError);
    expect(Space.Injector).to.be.equal(Injector);
    expect(Space.InjectionError).to.be.equal(InjectionError);
    expect(Space.Logger).to.be.equal(Logger);
    expect(Space.LoggingTransport).to.be.equal(LoggingTransport);
    expect(Space.ConsoleTransport).to.be.equal(ConsoleTransport);
    expect(Space.Module).to.be.equal(Module);
    expect(Space.App).to.be.equal(App);
  });
});

