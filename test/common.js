const values = require('lodash/values');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
const {extensions} = require('space-testing');
chai.use(sinonChai);

for (let extension of values(extensions.chai)) {
  chai.use(extension);
}


global.expect = chai.expect;
global.sinon = sinon;

