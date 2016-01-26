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
Space = new Namespace('Space');
Space.Namespace = Namespace;
Space.registry = { Space: Space };
