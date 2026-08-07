export interface Taxon {
    taxonId: string | number;
    acceptedScientificName: string;
    vernacularName?: string;
    nbObservations?: number;
    mediaUrl?: string; // Deprecated: use medias instead
    medias?: Media[];
    taxonRank?: string;
    description?: string;
    taxonSheetUrl?: string;
    lastSeenDate?: Date | null;
    kingdom?: string;
    class?: string;
    phylum?: string;
    order?: string;
    family?: string;
    genus?: string;
}
export enum MediaType {
    sound = 'sound',
    image = 'image',
}
export interface Media {
    url: string;
    source: string;
    typeMedia: MediaType;
    license?: string;
    author?: string;
    licenseUrl?: string;
    urlSource?: string;
}

export interface Dataset {
    uuid: string;
    name?: string;
    nbObservations: number;
}

export interface SearchResult {
    taxons: Taxon[];
    datasets: Dataset[];
}
