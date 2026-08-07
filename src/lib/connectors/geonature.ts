import { Connector, ConnectorOptions } from './connector';
import { SearchResult, Taxon } from '../models';
import { NO_IMAGE_URL } from '@/assets/constant';
import { TAXON_REFERENTIAL } from '../taxonReferential';
import { getMediaSource, SOURCE_ } from '../media/media';
import { useI18n } from 'vue-i18n';
import { CONNECTORS } from './connectors';

const GEONATURE_DEFAULT_LIMIT = 'ALL';

type OccurrenceParams = Record<string, any>;

export class GeoNatureConnector extends Connector {
    API_ENDPOINT: string | undefined;
    ID_EXPORT: number;
    LIMIT: string | number;
    SOURCE_NAME: string | undefined;

    constructor(options: ConnectorOptions) {
        super(options);
        this.name = CONNECTORS.GeoNature;
        this.API_ENDPOINT = options?.API_ENDPOINT;
        this.ID_EXPORT = options?.ID_EXPORT ?? 35;
        this.LIMIT = this.options?.LIMIT ?? GEONATURE_DEFAULT_LIMIT;
        this.SOURCE_NAME = options?.SOURCE_NAME;
        this.referential = TAXON_REFERENTIAL.TAXREF;

        this.imageSource = this.imageSource ?? getMediaSource(SOURCE_.inpn);
        this.soundSource = this.soundSource ?? getMediaSource(SOURCE_.inpn);

        this.taxonClass2SourceID = {
            Aves: null,
            Mammalia: null,
            Reptilia: null,
            Amphibia: null,
            Insecta: null,
            Arachnida: null,
            Gastropoda: null,
            Bivalvia: null,
            Magnoliopsida: null,
            Liliopsida: null,
            Pinopsida: null,
        };
    }

    getParamsSchema(): Array<Record<string, any>> {
        const { t } = useI18n();
        return [
            {
                name: 'API_ENDPOINT',
                label: t('geonature.api_endpoint'),
                type: String,
                default: 'https://demo.geonature.fr/geonature/api',
            },
            {
                name: 'ID_EXPORT',
                label: t('geonature.id_export'),
                type: Number,
                default: 35,
            },
            {
                name: 'LIMIT',
                label: t('limit'),
                type: Number,
                default: GEONATURE_DEFAULT_LIMIT,
            },
            {
                name: 'SOURCE_NAME',
                label: t('geonature.source_name'),
                type: String,
                default: undefined,
            },
        ];
    }

    fetchOccurrence(params: OccurrenceParams = {}): Promise<SearchResult> {
        super.fetchOccurrence(params);
        let urlWithParams = new URL(
            `${this.API_ENDPOINT}/exports/api/${this.ID_EXPORT}`
        );
        params = { ...params, limit: this.LIMIT, orderby: 'date_min:desc' };

        for (const [key, value] of Object.entries(params)) {
            urlWithParams.searchParams.append(key, value as string);
        }
        if (params.class) {
            urlWithParams.searchParams.append('classe', params.class);
        }

        const url = urlWithParams.toString();
        return fetch(url)
            .then((response) => response.json())
            .then((json) => {
                let taxonsData: Record<string, Taxon> = {};
                json.items.features.forEach((item: any) => {
                    item = item.properties;

                    if (!taxonsData.hasOwnProperty(item.cd_ref)) {
                        taxonsData[item.cd_ref] = {
                            acceptedScientificName: item.nom_scientifique,
                            vernacularName: item.nom_vernaculaire,
                            taxonId: item.cd_ref,
                            mediaUrl: NO_IMAGE_URL,
                            taxonRank: '', //this.fetchTaxonInfo(item.cd_ref),
                            nbObservations: 0,
                            description: '',
                            lastSeenDate: new Date(item.date_max),
                            class: item.classe,
                        };
                    }
                    taxonsData[item.cd_ref].nbObservations += 1;
                    taxonsData[item.cd_ref].lastSeenDate = new Date(
                        Math.max(
                            new Date(item.date_max).getTime(),
                            taxonsData[item.cd_ref].lastSeenDate.getTime()
                        )
                    );
                });
                return { taxons: Object.values(taxonsData), datasets: [] };
            });
    }

    fetchTaxonInfo(idTaxon: string): Promise<{
        scientificName: string;
        vernacularName: string;
        rank: string;
        taxonKey: number;
    }> {
        const url = `https://odata-inpn.mnhn.fr/taxa/${idTaxon}`;
        return fetch(url)
            .then((response) => response.json())
            .then((json) => ({
                scientificName: json.names.scientific,
                vernacularName: json.names.vernacular.fr[0],
                rank: json.rank,
                taxonKey: json.taxrefId,
            }));
    }

    fetchTaxonStatus(idTaxon: string): Promise<any> {
        // GeoNature uses Taxref status system, not IUCN Red List
        // Return null to indicate IUCN status is not available
        return Promise.resolve(null);
    }

    getTaxonDetailPage(taxonId: string): string {
        return `https://inpn.mnhn.fr/espece/cd_nom/${taxonId}`;
    }

    fetchVernacularName(taxonId: string | number): Promise<null> {
        return Promise.resolve(null);
    }

    getSourceName(): string {
        return this.SOURCE_NAME ?? this.name;
    }
}
