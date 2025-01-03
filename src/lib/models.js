class Taxon {
  constructor(taxonInfo) {
    this.acceptedScientificName = taxonInfo.scientificName;
    this.nbObservations = taxonInfo?.nbObservations;
    this.mediaUrl = taxonInfo?.mediaUrl;
    this.taxonId = taxonInfo?.taxonId;
    this.taxonRank = taxonInfo?.taxonRank;
    this.description = taxonInfo?.description;
    this.taxonSheetUrl = taxonInfo?.taxonSheetUrl;
  }
}
