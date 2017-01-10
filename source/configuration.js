import Space from './space.js';
import getenv from 'getenv';

if (Meteor.isServer) {
  Space.getenv = getenv;
}
