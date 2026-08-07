import { Connector } from '../connectors/connector';
import { Media, MediaType } from '../models';
import { TAXON_REFERENTIAL } from '../taxonReferential';
import { SOURCE_ } from './media';
import { MediaSource } from './MediaSource';

const { GBIF, TAXREF } = TAXON_REFERENTIAL;

interface WikidataResponse {
    results: {
        bindings: Array<{
            item: { value: string };
        }>;
    };
}

interface WikidataEntity {
    entities: {
        [key: string]: {
            claims?: Record<
                string,
                Array<{ mainsnak: { datavalue: { value: string } } }>
            >;
        };
    };
}

/**
 * SPARQL query to fetch Wikidata entity ID by external property (GBIF, TAXREF…)
 */
function fetchWikidataEntityByProperty(
    property: string,
    value: string
): Promise<string | null> {
    const url = 'https://query.wikidata.org/sparql';
    const query = `SELECT ?item WHERE { ?item wdt:${property} "${value}" . }`;

    return fetch(url + '?format=json&query=' + encodeURIComponent(query))
        .then((response) => response.json() as Promise<WikidataResponse>)
        .then((data) => {
            if (!data.results.bindings.length) return null;
            return data.results.bindings[0].item.value.split('/').pop() || null;
        });
}

/**
 * Generic fetcher for Wikidata media (image/audio)
 */
function fetchMediaFromWikidata(
    entityId: string,
    property: string,
    typeMedia: MediaType
): Promise<Media[]> {
    if (!entityId) {
        return Promise.resolve([]);
    }

    const url = `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`;

    return fetch(url)
        .then((response) => response.json() as Promise<WikidataEntity>)
        .then((data) => {
            const entity = data.entities[entityId];
            const claims = entity.claims || {};
            const mediaClaims = claims[property] || [];

            if (!mediaClaims.length) {
                return [];
            }

            const fileName = mediaClaims[0].mainsnak.datavalue.value;

            // Inline fetch Commons metadata
            const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(
                fileName
            )}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;

            return fetch(commonsUrl)
                .then((res) => res.json())
                .then((commonsData) => {
                    const pages = commonsData.query.pages;
                    const page = Object.values(pages)[0] as any;

                    if (!page?.imageinfo?.length) {
                        return [];
                    }

                    const info = page.imageinfo[0];
                    const meta = info.extmetadata || {};
                    const credit = {
                        artist: meta.Artist?.value || null,
                        license: meta.LicenseShortName?.value || null,
                        creditLine: meta.Credit?.value || null,
                        licenseUrl: meta.LicenseUrl?.value || null,
                    };

                    return [
                        {
                            url:
                                typeMedia === MediaType.image
                                    ? `https://commons.wikimedia.org/w/thumb.php?width=700&f=${fileName}`
                                    : info.url,
                            source: `${
                                credit.artist
                                    ? credit.artist.replace(/<[^>]*>?/gm, '')
                                    : ''
                            } - ${credit.license}`,
                            typeMedia,
                            licenseUrl: credit.licenseUrl,
                            license: credit.license,
                            author: credit.artist
                                ? credit.artist.replace(/<[^>]*>?/gm, '')
                                : credit.artist,
                            urlSource: `https://commons.wikimedia.org/wiki/File:${fileName}`,
                        },
                    ] as Media[];
                });
        });
}

/**
 * Resolve Wikidata ID from connector + fetch media
 */
function fetchWikidataMedia(
    idTaxon: string | number,
    connector: Connector,
    property: string,
    typeMedia: MediaType,
    wikidataEntryID: string | null = null
): Promise<Media[]> {
    if (!idTaxon) throw new Error('No taxonId given!');

    if (wikidataEntryID) {
        return fetchMediaFromWikidata(wikidataEntryID, property, typeMedia);
    }

    let fetchIDPromise: Promise<string | null> | null = null;

    switch (connector.referential) {
        case GBIF:
            fetchIDPromise = fetchWikidataEntityByProperty('P846', idTaxon);
            break;
        case TAXREF:
            fetchIDPromise = fetchWikidataEntityByProperty('P3186', idTaxon);
            break;
        default:
            break;
    }

    if (!fetchIDPromise) return Promise.resolve([]);

    return fetchIDPromise.then((idWikidata) => {
        if (idWikidata) {
            return fetchMediaFromWikidata(idWikidata, property, typeMedia);
        }
        return [];
    });
}

class WikiDataImageSource extends MediaSource {
    constructor() {
        super('Wikidata', SOURCE_.wikidata);
    }

    fetchPicture(
        taxonID: string | number,
        connector: Connector
    ): Promise<Media[] | undefined> {
        if (!this.isCompatible(connector)) {
            throw new Error(
                'Wikidata Image source is only compatible with GBIF and TAXREF connectors'
            );
        }
        return fetchWikidataMedia(
            taxonID,
            connector,
            'P18',
            MediaType.image
        ) as Promise<Media[] | undefined>;
    }

    fetchSound(
        taxonID: string,
        connector: Connector
    ): Promise<Media[] | undefined> {
        if (!this.isCompatible(connector)) {
            throw new Error(
                'Wikidata Sound source is only compatible with GBIF and TAXREF connectors'
            );
        }
        return fetchWikidataMedia(
            taxonID,
            connector,
            'P51',
            MediaType.sound
        ) as Promise<Media[] | undefined>;
    }

    isCompatible(connector: any): boolean {
        return [GBIF, TAXREF].includes(connector.referential);
    }

    /**
     * Fetch full credits for a media item that only has basic info.
     * Expects the filename to be stored in media.source field.
     * @param {Media} media - The media item with basic info (must have source field with filename)
     * @returns {Promise<Media>} The media item enriched with full credits
     */
    async getCredits(media: Media): Promise<Media> {
        if (!media.source) {
            throw new Error('Media source field must contain the filename');
        }

        const fileName = media.source;
        const typeMedia = media.typeMedia;

        // Fetch metadata from Commons API
        const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(
            fileName
        )}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;

        try {
            const res = await fetch(commonsUrl);
            const commonsData = await res.json();
            const pages = commonsData.query.pages;
            const page = Object.values(pages)[0] as any;

            if (!page?.imageinfo?.length) {
                return media; // Return original if no info found
            }

            const info = page.imageinfo[0];
            const meta = info.extmetadata || {};
            const credit = {
                artist: meta.Artist?.value || null,
                license: meta.LicenseShortName?.value || null,
                creditLine: meta.Credit?.value || null,
                licenseUrl: meta.LicenseUrl?.value || null,
            };

            return {
                url:
                    typeMedia === MediaType.image
                        ? `https://commons.wikimedia.org/w/thumb.php?width=700&f=${fileName}`
                        : info.url,
                source: `${
                    credit.artist ? credit.artist.replace(/<[^>]*>?/gm, '') : ''
                } - ${credit.license}`,
                typeMedia,
                licenseUrl: credit.licenseUrl,
                license: credit.license,
                author: credit.artist
                    ? credit.artist.replace(/<[^>]*>?/gm, '')
                    : credit.artist,
                urlSource: `https://commons.wikimedia.org/wiki/File:${fileName}`,
            } as Media;
        } catch (error) {
            console.error('Failed to fetch Commons media credits:', error);
            return media; // Return original on error
        }
    }
}

export { WikiDataImageSource };
