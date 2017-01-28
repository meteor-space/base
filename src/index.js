import Struct from './struct.js';
import SpaceError from './error.js';
import {Injector, InjectionError, Provider} from './injector.js';
import BaseLogger from './logger.js';
import LoggingTransport from './logging-transports/logging-transport.js';
import ConsoleTransport from './logging-transports/console-transport.js';
import Module from './module.js';
import App from './app.js';
import helpers from './helpers.js';
import dependencies from './decorators/dependencies-decorator.js';

const Logger = new BaseLogger;

const Space = {
  Struct: Struct,
  Error: SpaceError,
  Injector: Injector,
  InjectionError: InjectionError,
  Logger: Logger,
  LoggingTransport: LoggingTransport,
  ConsoleTransport: ConsoleTransport,
  Module: Module,
  App: App
};

export {
  Struct,
  SpaceError,
  Injector,
  InjectionError,
  Provider,
  Logger,
  LoggingTransport,
  ConsoleTransport,
  Module,
  App,
  Space,
  helpers,
  dependencies
};
