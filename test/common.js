const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
const {spaceChai} = require('space-testing');
chai.use(sinonChai);
chai.use(spaceChai);

global.expect = chai.expect;
global.sinon = sinon;

