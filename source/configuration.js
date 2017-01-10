import Space from './space.js';

if (Meteor.isServer) {
  Space.getenv = Npm.require('getenv');
}
