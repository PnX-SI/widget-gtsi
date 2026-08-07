<script setup>
    import { computed } from 'vue';
    import Loading from '@/components/commons/Loading.vue';
    import ProgressBar from '@/components/commons/ProgressBar.vue';
    import ParameterStore from '@/lib/parameterStore';

    const parameterStore = ParameterStore.getInstance();
    const { wkt } = parameterStore;

    const props = defineProps({
        loadingObservations: {
            type: Boolean,
        },
        loadingError: {
            type: Boolean,
        },
        loadingProgress: {
            type: Number,
            default: 0,
        },
        loadingMessage: {
            type: String,
            default: '',
        },
        speciesList: {
            type: Array,
        },
        filterSpeciesList: {
            type: Array,
        },
    });

    // Determine if we should show progress bar or simple loading spinner
    const showProgressBar = computed(
        () => props.loadingObservations && props.loadingProgress > 0
    );

    const showLoading = computed(
        () => props.loadingObservations && props.loadingProgress === 0
    );

    // Calcul des états pour l'affichage des messages
    const noGeometry = computed(
        () =>
            !wkt.value.length &&
            !props.loadingObservations &&
            !props.loadingError
    );

    const noDataFound = computed(
        () =>
            wkt.value.length &&
            !props.loadingObservations &&
            !props.loadingError &&
            !props.speciesList.length
    );

    const emptySearch = computed(
        () =>
            !props.filterSpeciesList.length &&
            wkt.value.length &&
            !props.loadingObservations
    );
</script>

<template>
    <div class="message">
        <!-- Progress bar for connectors with progress reporting -->
        <ProgressBar
            v-if="showProgressBar"
            :progress="props.loadingProgress"
            :message="props.loadingMessage"
            class="message-box"
        />

        <!-- Simple loading spinner for connectors without progress -->
        <Loading
            v-if="showLoading"
            id="loadingObs"
            :loadingStatus="true"
            class="message-box"
        />

        <!-- Message : No geometry -->
        <div class="message-box bg-secondary text-white" v-if="noGeometry">
            <h5>{{ $t('drawGeometry') }}</h5>
            <h5>
                <i class="bi bi-square-fill"></i>
                <i class="bi bi-hexagon-fill"></i>
                <i class="bi bi-circle-fill"></i>
                <i class="bi bi-geo-fill"></i>
            </h5>
        </div>

        <!-- Message : No taxa found -->
        <div class="message-box bg-warning text-white" v-if="noDataFound">
            {{ $t('noSpeciesObserved') }}
        </div>

        <!-- Message : Empty search -->
        <div
            class="message-box bg-warning text-white"
            v-if="emptySearch && !noDataFound && !loadingError"
        >
            {{ $t('emptySearch') }}
        </div>

        <!-- Message : Loading error -->
        <div
            id="loading-error"
            class="message-box bg-danger text-white"
            v-if="props.loadingError"
        >
            <h5><i class="bi bi-bug"></i> {{ $t('loadingError') }}</h5>
        </div>
    </div>
</template>

<style scoped>
    .message {
        width: 100%;
        display: flex;
        align-self: center;
        justify-content: center;
    }
    .message-box {
        width: 95%;
        border-radius: 10px;
        text-align: center;
        padding: 1em;
    }
    .message:not(:has(.message-box)) {
        display: none;
    }
</style>
