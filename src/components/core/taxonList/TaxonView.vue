<script setup lang="ts">
    import { ref, computed, watch } from 'vue';

    import { NO_IMAGE_URL } from '@/assets/constant';
    import { MediaType, Taxon } from '@/lib/models';
    import ParameterStore from '@/lib/parameterStore';

    // Components
    import TaxonThumbnail from './TaxonThumbnail.vue';
    import TaxonDetailed from './TaxonDetailed.vue';
    import { Connector } from '@/lib/connectors/connector';

    const { mode, connector, lang, customDetailPage } =
        ParameterStore.getInstance();

    const props = defineProps<{
        taxon: Taxon;
        cols: number;
    }>();

    const taxon = props.taxon;
    const speciesPhoto = ref([]);
    const speciesAudio = ref(null);
    const vernacularName = ref(taxon.vernacularName);
    const status = ref<{ status: string; color: string }>({});

    function fetchDetailUrl(taxonID) {
        if (customDetailPage.value) {
            const url = customDetailPage.value.replace('{taxonID}', taxonID);
            return url;
        }
        return connector.value.getTaxonDetailPage(taxon.taxonId);
    }

    function fetchTaxonImage() {
        speciesPhoto.value = [];

        // First priority: use medias array if available
        if (taxon.medias && taxon.medias.length > 0) {
            const images = taxon.medias.filter(
                (m) => m.typeMedia === MediaType.image
            );
            if (images.length > 0) {
                speciesPhoto.value = [...images];

                // For detailed view, fetch full credits if not already present
                images.forEach((media, index) => {
                    // Check if media already has full credits (has license field)
                    if (!media.license && media.source) {
                        // Use the media source's getCredits method to fetch full credits
                        connector.value.imageSource
                            .getCredits(media)
                            .then((enrichedMedia) => {
                                // Update the media with full credits
                                speciesPhoto.value[index] = enrichedMedia;
                            })
                            .catch((err) => {
                                console.warn(
                                    `Failed to fetch credits for ${media.source}:`,
                                    err
                                );
                            });
                    }
                });

                return;
            }
        }

        // Second priority: use mediaUrl for backward compatibility
        if (taxon.mediaUrl) {
            speciesPhoto.value = [
                {
                    url: taxon.mediaUrl,
                    typeMedia: MediaType.image,
                },
            ];
        }
        // Last resort: fetch from media source
        else if (taxon.taxonId) {
            connector.value.imageSource
                .fetchPicture(taxon.taxonId, connector.value)
                .then((response) => {
                    speciesPhoto.value = response;
                });
        }
    }
    function fetchTaxonAudio() {
        speciesAudio.value = null;

        // First priority: use medias array if available (includes full credits)
        if (taxon.medias && taxon.medias.length > 0) {
            const sounds = taxon.medias.filter(
                (m) => m.typeMedia === MediaType.sound
            );
            if (sounds.length > 0) {
                speciesAudio.value = sounds[0];
                return;
            }
        }

        // Fallback: fetch from media source
        if (taxon.taxonId) {
            connector.value.soundSource
                .fetchSound(taxon.taxonId, connector.value)
                .then((response) => {
                    if (response) speciesAudio.value = response[0];
                });
        }
    }
    const mediaDisplayed = computed(() => {
        if (!speciesPhoto.value) {
            return { url: NO_IMAGE_URL, typeMedia: MediaType.image };
        }
        return speciesPhoto.value.length == 0
            ? { url: NO_IMAGE_URL, typeMedia: MediaType.image }
            : speciesPhoto.value[0];
    });

    function refreshVernacularName() {
        if (taxon.vernacularName) {
            console.log('Vernacular name already exists, no need to fetch it');
            return;
        }
        connector.value.fetchVernacularName(taxon.taxonId).then((name) => {
            if (name) {
                taxon.vernacularName = name.split(',')[0];
            }
        });
    }

    function fetchStatus(connector: Connector) {
        connector
            .fetchTaxonStatus(taxon.taxonId)
            .then((status_) => {
                if (status_) {
                    status.value = {
                        status: status_,
                        color: connector.getStatusColor(status_),
                    };
                }
            })
            .catch((err) => {
                console.warn('Failed to fetch taxon status:', err);
            });
    }

    fetchTaxonImage();
    fetchTaxonAudio();
    refreshVernacularName();
    fetchStatus(connector.value);

    watch(lang, () => {
        refreshVernacularName();
    });
</script>

<template>
    <TaxonThumbnail
        v-if="mode == 'gallery'"
        :picture="mediaDisplayed"
        :audio="speciesAudio"
        :vernacular-name="taxon.vernacularName || taxon.acceptedScientificName"
        :url-detail-page="fetchDetailUrl(taxon.taxonId)"
        :accepted-scientific-name="taxon.acceptedScientificName"
        :cols="props.cols"
        :status="status"
    >
    </TaxonThumbnail>
    <TaxonDetailed
        v-else
        :picture="mediaDisplayed"
        :audio="speciesAudio"
        :accepted-scientific-name="taxon.acceptedScientificName"
        :vernacular-name="taxon.vernacularName || taxon.acceptedScientificName"
        :url-detail-page="fetchDetailUrl(taxon.taxonId)"
        :nb-observations="taxon?.nbObservations"
        :last-seen-date="taxon?.lastSeenDate"
        :status="status"
    />
</template>
