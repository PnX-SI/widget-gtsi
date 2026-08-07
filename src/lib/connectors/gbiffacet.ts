import { Connector, ConnectorOptions } from './connector';
import { Dataset, SearchResult, Taxon, Media, MediaType } from '../models';
import ParameterStore from '../parameterStore';
import { NO_IMAGE_URL } from '@/assets/constant';
import { TAXON_REFERENTIAL } from '../taxonReferential';
import { getMediaSource, SOURCE_ } from '../media/media';
import { useI18n } from 'vue-i18n';
import { CONNECTORS } from './connectors';
import { GBIFSearchScoring } from './search/gbif';
import { removeHoles } from './utils';
import { parse, stringify } from 'wellknown';
import { fetchJson } from '../utils';

const GBIF_ENDPOINT_DEFAULT = 'https://api.gbif.org/v1';
const GBIF_DEFAULT_TAXON_LIMIT = 1000;
const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

type OccurrenceParams = Record<string, any>;

interface TaxonWithAncestors extends Taxon {
    ancestors?: Array<{ id: number; name: string; rank: string }>;
    iconicTaxonName?: string;
    iNatId?: string;
}

interface WikidataBinding {
    gbifID: { value: string };
    iNatID?: { value: string };
    scientificName?: { value: string };
    commonName?: { value: string };
    image?: { value: string };
    kingdomLabel?: { value: string };
    phylumLabel?: { value: string };
    classLabel?: { value: string };
    orderLabel?: { value: string };
    familyLabel?: { value: string };
    genusLabel?: { value: string };
}

interface EnrichedTaxonData {
    scientificName?: string;
    commonName?: string;
    medias?: Media[];
    iNatId?: string;
    ancestors?: any[];
    kingdom?: string;
    phylum?: string;
    order?: string;
    family?: string;
    genus?: string;
    iconicTaxonName?: string;
}

function buildUrl(base: string, params: Record<string, any>): string {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, v));
        } else if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
        }
    });
    return url.toString();
}

function callOccurrenceApi(params: OccurrenceParams = {}): Promise<any> {
    return fetchJson<any>(
        buildUrl(`${GBIF_ENDPOINT_DEFAULT}/occurrence/search`, params)
    );
}

export class GbifFacetConnector extends Connector {
    name: string;
    GBIF_ENDPOINT: string;
    LIMIT: number;
    NB_PAGES: number = 1;
    private enrichTaxonomyCache: Map<string, EnrichedTaxonData> = new Map();

    taxonClass2SourceID = {
        Aves: 212,
        Mammalia: 359,
        Reptilia: 358,
        Amphibia: 131,
        Insecta: 216,
        Arachnida: 367,
        Gastropoda: 225,
        Bivalvia: 137,
        Magnoliopsida: 220,
        Liliopsida: 196,
        Pinopsida: 194,
    };

    constructor(options: ConnectorOptions) {
        super(options);
        this.name = CONNECTORS.GBIF_FACET;
        this.GBIF_ENDPOINT = options?.GBIF_ENDPOINT || GBIF_ENDPOINT_DEFAULT;
        this.LIMIT = options?.LIMIT || GBIF_DEFAULT_TAXON_LIMIT;

        this.referential = TAXON_REFERENTIAL.GBIF;
        this.imageSource = this.imageSource || getMediaSource(SOURCE_.wikidata);
        this.soundSource = this.soundSource || getMediaSource(SOURCE_.wikidata);

        this.isSearchOnAPIAvailable = true;
        this.scoringSearchClass = new GBIFSearchScoring();
    }

    getParamsSchema(): Array<Record<string, any>> {
        const { t } = useI18n();
        return [
            {
                name: 'GBIF_ENDPOINT',
                label: "Adresse de l'API du GBIF",
                type: String,
                default: GBIF_ENDPOINT_DEFAULT,
            },
            {
                name: 'LIMIT',
                label: t('limit'),
                type: Number,
                default: GBIF_DEFAULT_TAXON_LIMIT,
            },
        ];
    }

    fetchVernacularName(taxonID: string | number): Promise<string | undefined> {
        const mapping_language: Record<string, string> = {
            en: 'eng',
            fr: 'fra',
            es: 'spa',
            cs: 'ces',
            it: 'ita',
            de: 'deu',
        };
        const currentLanguage = ParameterStore.getInstance().lang.value;

        return fetchJson(
            `${this.GBIF_ENDPOINT}/species/${taxonID}/vernacularNames?limit=100`
        ).then((data) => {
            const match = data.results.find(
                (r: any) => r.language === mapping_language[currentLanguage]
            );
            return match
                ? match.vernacularName.charAt(0).toUpperCase() +
                      match.vernacularName.slice(1)
                : undefined;
        });
    }

    private buildWikidataSparql(gbifIds: string[], lang: string): string {
        const values = gbifIds.map((id) => `"${id}"`).join(' ');
        return `
        SELECT ?gbifID ?iNatID ?scientificName ?commonName ?image
               ?kingdomLabel ?phylumLabel ?classLabel ?orderLabel ?familyLabel ?genusLabel
        WHERE {
            VALUES ?gbifID { ${values} }
            ?taxon wdt:P846 ?gbifID .
            OPTIONAL { ?taxon wdt:P3151 ?iNatID . }
            OPTIONAL { ?taxon wdt:P225 ?scientificName . }
            OPTIONAL { ?taxon p:P1843 ?commonNameStatement .
                       ?commonNameStatement ps:P1843 ?commonName .
                       FILTER(LANG(?commonName) = "${lang}")
            }
            OPTIONAL { ?taxon wdt:P18 ?image . }
            
            # Walk the taxonomy tree to get parent taxon ranks - use scientific names directly
            OPTIONAL {
                ?taxon wdt:P171* ?kingdom .
                ?kingdom wdt:P105 wd:Q36732 .
                ?kingdom wdt:P225 ?kingdomLabel .
            }
            OPTIONAL {
                ?taxon wdt:P171* ?phylum .
                ?phylum wdt:P105 wd:Q38348 .
                ?phylum wdt:P225 ?phylumLabel .
            }
            OPTIONAL {
                ?taxon wdt:P171* ?class .
                ?class wdt:P105 wd:Q37517 .
                ?class wdt:P225 ?classLabel .
            }
            OPTIONAL {
                ?taxon wdt:P171* ?order .
                ?order wdt:P105 wd:Q36602 .
                ?order wdt:P225 ?orderLabel .
            }
            OPTIONAL {
                ?taxon wdt:P171* ?family .
                ?family wdt:P105 wd:Q35409 .
                ?family wdt:P225 ?familyLabel .
            }
            OPTIONAL {
                ?taxon wdt:P171* ?genus .
                ?genus wdt:P105 wd:Q34740 .
                ?genus wdt:P225 ?genusLabel .
            }
        }
    `;
    }

    private async enrichTaxonomy(
        gbifIds: string[]
    ): Promise<Map<string, EnrichedTaxonData>> {
        const uncachedIds = gbifIds.filter(
            (id) => !this.enrichTaxonomyCache.has(id)
        );
        if (!uncachedIds.length) return this.enrichTaxonomyCache;
        const currentLang = ParameterStore.getInstance().lang.value;

        try {
            // Fetch all Wikidata data in a single POST (no URL length limit)
            const sparql = this.buildWikidataSparql(uncachedIds, currentLang);
            const wikidataResponse = await fetch(WIKIDATA_SPARQL_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/sparql-results+json',
                },
                body: new URLSearchParams({ query: sparql }),
            });
            if (!wikidataResponse.ok)
                throw new Error(
                    `Wikidata POST failed: ${wikidataResponse.status}`
                );
            const wikidataData = await wikidataResponse.json();

            // Process Wikidata results - now includes parent taxon ranks
            // Store basic media info (filename) without fetching credits
            // Credits will be fetched on-demand when detailed view is rendered
            wikidataData.results.bindings.forEach((b: WikidataBinding) => {
                const gbifId = b.gbifID.value;
                let medias: Media[] = [];

                // Store basic media with thumbnail URL and filename for later credit fetching
                if (b.image?.value) {
                    const encodedFileName = b.image.value.split('/').pop();
                    if (encodedFileName) {
                        // Decode the filename from the Wikidata URL
                        const fileName = decodeURIComponent(encodedFileName);
                        medias = [
                            {
                                url: `https://commons.wikimedia.org/w/thumb.php?width=400&f=${encodeURIComponent(fileName)}`,
                                typeMedia: MediaType.image,
                                source: fileName, // Store decoded filename for later credit fetching
                            },
                        ];
                    }
                }

                const enrichedData: EnrichedTaxonData = {
                    scientificName: b.scientificName?.value,
                    commonName: b.commonName?.value?.replace(/^./, (char) =>
                        char.toUpperCase()
                    ),
                    medias,
                    iNatId: b.iNatID?.value,
                    // Parent taxon ranks from Wikidata - eliminates need for iNaturalist
                    kingdom: b.kingdomLabel?.value,
                    phylum: b.phylumLabel?.value,
                    order: b.orderLabel?.value,
                    family: b.familyLabel?.value,
                    genus: b.genusLabel?.value,
                    // Use class as iconicTaxonName for backward compatibility
                    iconicTaxonName: b.classLabel?.value,
                };

                this.enrichTaxonomyCache.set(gbifId, enrichedData);
            });
        } catch (e) {
            console.error(`[${this.name}] enrichTaxonomy failed`, e);
        }

        return this.enrichTaxonomyCache;
    }

    /* ---------- fetchOccurrence ---------- */
    fetchOccurrence(params: any = {}): Promise<SearchResult> {
        super.fetchOccurrence(params);
        const { t } = useI18n();

        if (params.geometry)
            params.geometry = stringify(removeHoles(parse(params.geometry)));

        const defaultParams = {
            facet: ['speciesKey', 'datasetKey'],
            facetLimit: this.LIMIT,
            limit: 0,
            occurrenceStatus: 'PRESENT',
            basisOfRecord: [
                'OBSERVATION',
                'HUMAN_OBSERVATION',
                'MACHINE_OBSERVATION',
                'OCCURRENCE',
            ],
            hasGeospatialIssue: false,
            hasCoordinate: true,
            ...params,
        };

        if (defaultParams.dateMin && defaultParams.dateMax) {
            defaultParams.eventDate = `${defaultParams.dateMin},${defaultParams.dateMax}`;
            delete defaultParams.dateMin;
            delete defaultParams.dateMax;
        }

        if (params?.class) {
            defaultParams.classKey = this.taxonClass2SourceID[params?.class];
            delete defaultParams.class;
        }

        // Step 1 (25%): API GBIF call
        this.reportProgress(25, t('gbif.progress.fetching'));

        return callOccurrenceApi(defaultParams).then(async (gbifData) => {
            // Step 2 (50%): Extract facets
            this.reportProgress(50, t('gbif.progress.processing'));

            if (!gbifData.facets || gbifData.facets.length === 0)
                return { taxons: [], datasets: [] };

            const taxonFacet = gbifData.facets.find(
                (f: any) => f.field === 'SPECIES_KEY'
            );
            const datasetFacet = gbifData.facets.find(
                (f: any) => f.field === 'DATASET_KEY'
            );

            const datasets: Dataset[] =
                datasetFacet?.counts.map((facet: any) => ({
                    uuid: facet.name,
                    name: facet.name,
                    nbObservations: facet.count,
                })) || [];

            if (!taxonFacet || !taxonFacet.counts)
                return { taxons: [], datasets };

            // Step 3 (75%): Wikidata enrichment
            this.reportProgress(75, t('gbif.progress.enriching'));

            // Parallel prefetch: Start Wikidata enrichment immediately, don't await yet
            const speciesIds = taxonFacet.counts.map((f: any) => f.name);
            const enrichmentPromise = this.enrichTaxonomy(speciesIds);

            // Do any other synchronous work here while Wikidata fetches in parallel
            // (In this case, datasets are already processed above)

            // Now await the enrichment data
            const enrichmentMap = await enrichmentPromise;

            // Step 4 (100%): Build taxons
            this.reportProgress(100, t('gbif.progress.finalizing'));

            const taxons: TaxonWithAncestors[] = taxonFacet.counts.map(
                (facet: any) => {
                    const gbifId = facet.name;
                    const enrichment = enrichmentMap.get(gbifId);

                    // For backward compatibility, set mediaUrl to first image or NO_IMAGE_URL
                    const firstImageUrl =
                        enrichment?.medias?.find(
                            (m) => m.typeMedia === MediaType.image
                        )?.url || NO_IMAGE_URL;

                    const taxon: Taxon = {
                        taxonId: gbifId,
                        acceptedScientificName:
                            enrichment?.scientificName || '',
                        vernacularName: enrichment?.commonName || '',
                        taxonRank: 'SPECIES',
                        nbObservations: facet.count,
                        mediaUrl: firstImageUrl, // Backward compatibility
                        medias: enrichment?.medias || [],
                        description: '',
                        lastSeenDate: new Date(),
                        kingdom: enrichment?.kingdom || '',
                        class: enrichment?.iconicTaxonName || '',
                    };

                    return taxon;
                }
            );

            return { taxons, datasets };
        });
    }

    fetchTaxonInfo(idTaxon: string) {
        return fetchJson<any>(`${this.GBIF_ENDPOINT}/species/${idTaxon}`).then(
            (json) => ({
                scientificName: json.scientificName,
                vernacularName: json.vernacularName,
                rank: json.rank,
                taxonKey: json.key,
            })
        );
    }

    fetchTaxonStatus(idTaxon: string) {
        return fetchJson<{ category: string; code: string }>(
            `${this.GBIF_ENDPOINT}/species/${idTaxon}/iucnRedListCategory`
        ).then((json) => json.code);
    }

    searchTaxon(searchString: string = '', params: OccurrenceParams = {}) {
        return fetchJson<any>(
            `${this.GBIF_ENDPOINT}/species/search?q=${searchString}&limit=20`
        ).then((json) =>
            json.results.map((e: any) => ({
                scientificName: e.scientificName,
                taxonKey: e.key,
            }))
        );
    }

    getTaxonDetailPage(taxonId: string) {
        return `https://www.gbif.org/species/${taxonId}`;
    }

    sourceDetailMessage() {
        return useI18n().t('source.gbifWarning', {
            nbObs: this.LIMIT * this.NB_PAGES,
        });
    }

    getSourceUrl() {
        return 'https://www.gbif.org';
    }
    getDatasetUrl(datasetID: any) {
        return `${this.getSourceUrl()}/dataset/${datasetID}`;
    }

    searchOnAPI(searchString: string) {
        return fetchJson<any>(
            `${this.GBIF_ENDPOINT}/species/search?q=${searchString}&status=ACCEPTED&qField=VERNACULAR&limit=100`
        ).then((json) => json.results);
    }
}

export default GbifFacetConnector;
