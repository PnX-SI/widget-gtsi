import { parse, stringify } from 'wellknown';
import { getMediaSource, SOURCE_ } from '../media/media';
import { MediaSource } from '../media/MediaSource';
import { TAXON_REFERENTIAL } from '../taxonReferential';
import { SearchScoring } from './search/scoring';
import { simplifyPolygon } from './utils';

const MAX_NB_POLYGON_COORDINATES = 190;
export interface ConnectorOptions {
    imageSource?: string | MediaSource;
    soundSource?: string | MediaSource;
    [key: string]: any;
}
export type IUCNCodeStatus =
    'NA' | 'NE' | 'DD' | 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'RE' | 'EW' | 'EX';

export class Connector {
    /**
     * Name of the Connector
     * @type {string}
     */
    name: string;

    /**
     * Mapping between a taxon's class and the corresponding ID in the referential used by the connector
     * @type {Record}
     */
    taxonClass2SourceID: Record<string, number> = {};

    /**
     * ID of taxon's referential used by the datasource (for example: GBIF, Taxref)
     * @type {TAXON_REFERENTIAL}
     */
    referential?: TAXON_REFERENTIAL;

    /**
     * Contains parameters that will or not be used by the connector.
     * @type {ConnectorOptions}
     */
    options: ConnectorOptions;

    /**
     * The source that will be used to fetch a taxon picture
     * @type {MediaSource}
     */
    imageSource?: MediaSource;

    /**
     * The source that will be use to fetch sound made by an animal
     * @type {MediaSource}
     */
    soundSource?: MediaSource;

    /**
     * Indicates if a taxon search endpoint on the current connector is available
     * @type {boolean}
     */
    isSearchOnAPIAvailable: boolean = false;

    /**
     * Class that describe how to sort the taxon list based on a search string
     */
    scoringSearchClass: SearchScoring = new SearchScoring();

    /**
     * Optional callback function to report progress during long-running operations
     * @type {Function}
     */
    onProgress?: (progress: number, message?: string) => void;

    constructor(options: ConnectorOptions) {
        this.options = options;

        this.imageSource = this.parseMediaSource(options?.imageSource);
        this.soundSource = this.parseMediaSource(options?.soundSource);
    }

    /**
     * Helper method to report progress if a callback is configured
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Optional message to display
     */
    protected reportProgress(progress: number, message?: string): void {
        if (this.onProgress) {
            this.onProgress(progress, message);
        }
    }

    /**
     * Used to parse the imageSource and soundSource parameter.
     * @param {MediaSource | string} mediaSource
     * @returns {MediaSource}
     */
    parseMediaSource(
        mediaSource?: string | MediaSource
    ): MediaSource | undefined {
        if (typeof mediaSource === 'string') {
            return getMediaSource(SOURCE_[mediaSource]);
        }
        return mediaSource;
    }

    /**
     * Return a list of parameters definition, its type, its name, its label, etc.
     * @returns Record<string,any> parameters definition
     */
    getParamsSchema(): Record<string, any> {
        return {};
    }

    /**
     * Returns specific parameters for a Connector
     * @returns {Object}
     */
    getParams(): Record<string, any> {
        const params: Record<string, any> = {};
        Object.entries(this)
            .filter(
                ([key, _]) =>
                    ![
                        'options',
                        'params',
                        'name',
                        'taxonClass2SourceID',
                        'referential',
                        'soundSource',
                        'imageSource',
                    ].includes(key)
            )
            .filter(([_, value]) => typeof value !== 'object')
            .forEach(([key, value]) => {
                params[key] = value;
            });

        if (this.soundSource) {
            params['soundSource'] = this.soundSource.id;
        }
        if (this.imageSource) {
            params['imageSource'] = this.imageSource.id;
        }
        return params;
    }

    /**
     * Fetches occurrences based on the given parameters.
     * @param {Object} params - The parameters for the occurrence query.
     * @returns {Promise<Object>} A promise that resolves to the taxons data.
     */
    fetchOccurrence(params: Record<string, any>): Promise<any> {
        if (
            params.geometry.includes('POLYGON') ||
            params.geometry.includes('MULTIPOLYGON')
        ) {
            const geojson = simplifyPolygon(
                parse(params.geometry),
                0.001,
                MAX_NB_POLYGON_COORDINATES
            );
            params.geometry = stringify(geojson);
        }
        return Promise.resolve({});
    }

    /**
     * Fetches taxon information for a given taxon ID.
     * @param {string} idTaxon - The ID of the taxon.
     * @returns {Promise<Object>} A promise that resolves to the taxon information.
     */
    fetchTaxonInfo(idTaxon: string): Promise<any> {
        throw new Error('Not implemented');
    }

    /**
     * Searches for taxa based on a search string.
     * @param {string} searchString - The search string.
     * @param {Object} params - Additional parameters for the search.
     * @returns {Promise<Array>} A promise that resolves to the list of search results.
     */
    searchTaxon(
        searchString: string = '',
        params: Record<string, any> = {}
    ): Promise<any[]> | undefined {
        // Not implemented in original code
        return undefined;
    }

    /**
     * Gets the detail page URL for a given taxon ID.
     * @param {string} taxonId - The ID of the taxon.
     * @returns {string} The URL of the taxon detail page.
     */
    getTaxonDetailPage(taxonId: string): string {
        throw new Error('Not implemented');
    }

    /**
     * Fetches the vernacular name for a given taxon ID.
     * @param {string} taxonID - The ID of the taxon.
     * @returns {Promise<string|undefined>} A promise that resolves to the vernacular name if found.
     */
    fetchVernacularName(taxonID: string | number): Promise<string | undefined> {
        throw new Error('Not implemented');
    }

    /**
     * Return details concerning the data retrieved with this source
     * @returns source detail
     */
    sourceDetailMessage(): string | null {
        return null;
    }

    /**
     * Return a message to explain how to contribute to the data source
     * @returns contribution message
     */
    howToContributeMessage(): string | null {
        return null;
    }

    /**
     * Returns an array of media sources that are compatible with this connector.
     * Each item in the array is an object with a 'value' property that is the ID of the media source,
     * and a 'text' property that is the name of the media source.
     * @returns {Array<{ value: string; text: string }>} An array of compatible media sources.
     */
    getCompatibleMediaSource(): Array<{ value: string; text: string }> {
        const availableSource: Array<{ value: string; text: string }> = [];
        Object.values(SOURCE_).forEach((idMediaSource) => {
            const mediaSource = getMediaSource(idMediaSource);
            if (mediaSource.isCompatible(this)) {
                availableSource.push({
                    value: idMediaSource,
                    text: mediaSource.name,
                });
            }
        });
        return availableSource;
    }

    /**
     * Returns the URL of the data source of this connector.
     * @returns {string|null} The URL of the data source if found, null otherwise.
     */
    getSourceUrl(): string | null {
        return null;
    }

    /**
     * Returns the URL of the dataset identified by datasetID.
     * @param {string} datasetID - The ID of the dataset.
     * @returns {string | null} The URL of the dataset if found, null otherwise.
     */
    getDatasetUrl(datasetID): string | null {
        return null;
    }

    /**
     * Searches for taxa based on a search string using the API of the connector. Will be
     * used only if `isSearchOnAPIAvailable` is set to true
     * @param {string} searchString - The search string.
     * @returns {Promise<any>} A promise that resolves to the list of search results.
     */
    searchOnAPI(searchString: string): Promise<any> {
        throw new Error('Not implemented');
    }

    /**
     * Retrieves the conservation status of a taxon.
     * @param {string|number} taxonId - The ID of the taxon.
     * @returns {Promise<string>} A promise that resolves to the conservation status of the taxon.
     */
    fetchTaxonStatus(taxonId: string | number): Promise<IUCNCodeStatus> {
        return Promise.resolve(null);
    }

    /**
     * Returns the name of the source.
     * @returns {string} The name of the source.
     */
    getSourceName(): string {
        return this.name;
    }

    /**
     * Returns the color associated with a given IUCN conservation status code.
     * @param {IUCNCodeStatus} status - The IUCN conservation status code.
     * @returns {string} The color associated with the given IUCN conservation status code.
     */
    getStatusColor(status: IUCNCodeStatus): string {
        const IUCNStatusColorDICT = {
            NA: '#C1B5A5',
            NE: '#FFFFFF',
            DD: '#D1D1C6',
            LC: '#60C659',
            NT: '#CCE226',
            VU: '#F9E814',
            EN: '#FC7F3F',
            CR: '#D81E05',
            RE: '#9B4F96',
            EW: '#542344',
            EX: '#000000',
        };
        return IUCNStatusColorDICT[status];
    }
}
