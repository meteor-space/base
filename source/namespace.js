class Namespace {
  constructor(path) {
    this._path = path;
  }
  getPath() {
    return this._path;
  }
  toString() {
    return this._path;
  }
}

// Define global namespace for the space framework
this.Space = new Namespace('Space');
this.Space.Namespace = Namespace;
this.Space.registry = {};

export default Space;
