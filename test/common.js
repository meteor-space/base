const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
const spaceTesting = require('space-testing');

global.expect = chai.expect;
global.sinon = sinon;

chai.use(sinonChai);
chai.use(spaceTesting);

