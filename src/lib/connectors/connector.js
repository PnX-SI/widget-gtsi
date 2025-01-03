class Connector {
  constructor(options) {
    this.options = options;
  }
  fetchOccurrence(params) {
    throw new Error("Not implemented");
  }
  fetchMedia(idTaxon) {
    throw new Error("Not implemented");
  }
  fetchTaxonInfo(idTaxon) {
    throw new Error("Not implemented");
  }
  fetchTaxonStatus(idTaxon) {
    throw new Error("Not implemented");
  }
}

export { Connector };
