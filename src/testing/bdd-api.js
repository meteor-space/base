import {isNil} from 'lodash';
import Module from '../module.js';
import App from '../app.js';
import isSubclassOf from 'space-testing';

const registeredBddApis = [];

Module.registerBddApi = api => registeredBddApis.push(api);

Module.test = App.test = function(systemUnderTest, app = null) {
  if (isNil(systemUnderTest)) {
    throw new Error('Cannot test <undefined>');
  }
  let testApi = null;
  const isModule = isSubclassOf(this, Module);
  const isApp = isSubclassOf(this, App);

  // BDD API relies on dependency injection provided by App
  if (isNil(app)) {
    if (isApp) {
      app = new this();
    } else {
      app = new new App({
        configuration: {
          appId: 'testApp'
        },
        modules: [this]
      });
    }
  }
  for (let api of registeredBddApis) {
    returnValue = api(app, systemUnderTest);
    if (!isNil(returnValue)) {
      testApi = returnValue;
    }
  }
  if (isNil(testApi)) {
    throw new Error(`No testing API found for ${systemUnderTest}`);
  }
  return testApi;
};
