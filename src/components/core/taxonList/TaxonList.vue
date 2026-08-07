<script setup>
    import { ref, computed, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import SortBy from '@/components/commons/SortBy.vue';
    import SearchForm from '@/components/commons/SearchForm.vue';
    import TaxonView from './TaxonView.vue';
    import { TAXONLIST_DISPLAY_MODE } from '@/lib/enums';
    import TaxonClassFilterBadge from '@/components/commons/TaxonClassFilterBadge.vue';
    import ParameterStore from '@/lib/parameterStore';
    import { TaxonListManager } from './taxonListManager';

    const { t } = useI18n();
    const parameterStore = ParameterStore.getInstance();

    const {
        wkt,
        dateMin,
        dateMax,
        nbTaxonPerLine,
        showFilters,
        connector,
        mode,
        class: class_,
        nbDisplayedSpecies,
        filtersOnList,
    } = parameterStore;

    const props = defineProps({
        nbTaxonPerLine: { type: Number },
        showFilters: { type: Boolean, default: true },
        sortBy: {
            type: String,
            default: 'nbObservations',
            validator: (value) =>
                [
                    'vernacularName',
                    'acceptedScientificName',
                    'nbObservations',
                    'lastSeenDate',
                ].includes(value),
        },
        order: {
            type: String,
            default: 'desc',
            validator: (value) => ['asc', 'desc'].includes(value),
        },
        mode: {
            type: String,
            validator: (value) =>
                Object.keys(TAXONLIST_DISPLAY_MODE).includes(value),
        },
        height: { type: String, default: '100svh' },
    });

    nbTaxonPerLine.value = props.nbTaxonPerLine ?? nbTaxonPerLine.value;
    mode.value = props.mode ?? mode.value;

    const taxonManager = new TaxonListManager(
        connector,
        {
            sortBy: props.sortBy,
            order: props.order,
            nbDisplayedSpecies: nbDisplayedSpecies,
        },
        {
            wkt,
            dateMin,
            dateMax,
            class: class_,
        },
        nbDisplayedSpecies
    );

    const {
        searchResult,
        filteredSpecies,
        searchString,
        filterClass,
        sortBy,
        orderBy,
        pageIndex,
        loadingObservations,
        loadingError,
        loadingProgress,
        loadingMessage,
    } = taxonManager;

    const speciesList = computed(() => searchResult.value.taxons);
    const datasets = computed(() => searchResult.value.datasets);

    const rowColsLg = computed(() => nbTaxonPerLine.value);

    const rowColsMd = computed(() =>
        rowColsLg.value === 1 ? 1 : Math.round(rowColsLg.value / 2)
    );

    const rowColsSm = computed(() => Math.round(rowColsMd.value / 2));

    const classNames = computed(() => {
        return `row row-cols-${rowColsSm.value} row-cols-lg-${rowColsLg.value} row-cols-md-${rowColsMd.value} row-gap-4`;
    });

    function onScroll(event) {
        taxonManager.onScroll(event);
    }

    watch([searchString, filterClass], () => {
        taxonManager.updateFilteredSpecies();
        pageIndex.value = 0;
    });

    watch([wkt, class_, dateMin, dateMax, connector], () => {
        searchResult.value = { taxons: [], datasets: [] };
        if (wkt.value) taxonManager.fetchSpeciesList(wkt.value);
    });

    if (wkt.value) {
        searchResult.value = { taxons: [], datasets: [] };
        taxonManager.fetchSpeciesList(wkt.value);
    }

    const sortByAvailable = [
        { field_name: 'vernacularName', label: t('taxon.vernacularName') },
        {
            field_name: 'acceptedScientificName',
            label: t('taxon.scientificName'),
        },
        { field_name: 'nbObservations', label: t('taxon.nbObservations') },
        { field_name: 'lastSeenDate', label: t('taxon.lastSeenDate') },
    ];
</script>
<template>
    <div
        id="taxon-list"
        :style="{ height: props.height }"
        data-testid="Taxon list"
    >
        <div class="list-container">
            <div
                id="taxon-list-filter"
                data-testid="Taxon list filters"
                :class="{ 'overlap-filter': filtersOnList }"
            >
                <TaxonListModeSelection />
                <TaxonClassFilterBadge
                    v-if="!class_"
                    @select:class="(newClass) => (filterClass = newClass)"
                />
                <SortBy
                    v-if="showFilters"
                    :sort-by-available="sortByAvailable"
                    @update:sortBy="(newSort) => (sortBy = newSort)"
                    @update:orderBy="(newOrder) => (orderBy = newOrder)"
                    :sortBy="sortBy"
                    :orderBy="orderBy"
                />
                <SearchForm
                    v-if="showFilters"
                    @update:searchString="
                        (newSearchString) => (searchString = newSearchString)
                    "
                />
            </div>

            <div
                class="taxon-list-scroll-wrapper"
                :class="{ 'pt-0': !filtersOnList }"
            >
                <div id="taxon-list-content" @scroll="onScroll">
                    <TaxonListMessages
                        :loading-error="loadingError"
                        :loading-observations="loadingObservations"
                        :loading-progress="loadingProgress"
                        :loading-message="loadingMessage"
                        :species-list="speciesList"
                        :filter-species-list="filteredSpecies"
                    />
                    <TaxonView
                        v-for="observation in taxonManager.speciesListShowed
                            .value"
                        :key="observation.taxonId"
                        :taxon="observation"
                        :cols="rowColsSm"
                    />
                </div>
            </div>

            <TaxonListFooter
                :loading-done="wkt.length && !loadingObservations"
                :number-of-species="speciesList.length"
                :datasets="datasets"
            />
        </div>
    </div>
</template>
<style scoped>
    #taxon-list {
        display: flex;
        flex-direction: column;
        border: 1px solid #efefef;
        border-radius: 8px;
    }

    .list-container {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }

    #taxon-list-filter {
        margin-top: 1em;
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1em;
        flex-wrap: wrap;
        margin-bottom: 1em;
    }

    .overlap-filter {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        padding: 0.8em 1em;
        z-index: 10;
        margin-bottom: 0;
        pointer-events: none;
    }
    .overlap-filter > * {
        pointer-events: auto; /* Re-enable clicks on child elements (filters) */
    }

    .taxon-list-scroll-wrapper {
        flex-grow: 1;
        overflow: hidden;
        padding-top: 0em;
    }

    #taxon-list-content {
        display: grid;
        grid-template-columns: repeat(v-bind(rowColsSm), 1fr);
        gap: 20px;
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;
        padding: 0 1rem;
        -ms-overflow-style: none; /* Internet Explorer 10+ */
        scrollbar-width: none;
    }

    @media (min-width: 768px) {
        #taxon-list-content {
            grid-template-columns: repeat(v-bind(rowColsMd), 1fr);
        }
    }

    @media (min-width: 992px) {
        #taxon-list-content {
            grid-template-columns: repeat(v-bind(rowColsLg), 1fr);
        }
    }

    /* Disable Bootstrap column sizing since we're using Grid */
    #taxon-list-content > :deep(*) {
        width: 100%;
        max-width: 100%;
    }

    /* Make TaxonListMessages span all columns and center */
    #taxon-list-content > :deep(.message) {
        grid-column: 1 / -1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #taxon-list-content ::-webkit-scrollbar {
        display: none; /* Safari and Chrome */
    }
</style>
