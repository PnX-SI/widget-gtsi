<script setup lang="ts">
    import { Media } from '@/lib/models';
    import { computed, onMounted, ref, watch } from 'vue';
    import ParameterStore from '@/lib/parameterStore';
    import { StatusInfo } from './interface';
    import CopyrightIcon from '@/components/commons/CopyrightIcon.vue';

    const { isMobile, nbTaxonPerLine } = ParameterStore.getInstance();

    const props = defineProps<{
        picture: Media;
        audio: Media;
        vernacularName: string;
        acceptedScientificName: string;
        urlDetailPage: string;
        cols: number;
        status: StatusInfo;
    }>();

    const sizeIcon = computed(() => {
        return isMobile.value ? 50 : 30;
    });
    const colClasses = computed(() => {
        const lg = Math.floor(12 / nbTaxonPerLine.value);
        const md = Math.floor(12 / Math.ceil(nbTaxonPerLine.value / 2));

        return [
            'col-12', // sm → 1 per row
            `col-md-${md}`, // md → nbTaxonPerLine / 2
            `col-lg-${lg}`, // lg → nbTaxonPerLine
        ];
    });
</script>

<template>
    <div
        :class="['card', 'thumbnail', ...colClasses]"
        data-testid="Taxon thumbnail view"
    >
        <Image :image-url="props.picture?.url" :alt="props.picture?.url" />

        <FullScreenImage
            v-if="props.picture?.url"
            :media="props.picture"
            :alt="props.picture?.urlSource"
        >
            <div class="card-img-overlay">
                <div class="card-title">
                    <StatusIcon
                        v-if="props.status?.status"
                        :status="props.status.status"
                        :color="props.status.color"
                        :size="'1rem'"
                    ></StatusIcon>
                    <a
                        style="color: inherit; text-decoration: inherit"
                        :href="props.urlDetailPage"
                        target="_blank"
                    >
                        <span
                            class="vernacularName"
                            :class="{
                                'cols-2-plus': props.cols >= 2,
                            }"
                            >{{ props.vernacularName }}</span
                        >
                    </a>
                </div>

                <!-- Bottom Controls (audio + copyright) -->
                <div class="bottom-controls">
                    <div
                        class="player"
                        :class="{
                            'cols-2-plus': props.cols >= 2,
                        }"
                    >
                        <AudioPlayer
                            v-if="props.audio"
                            :audio="props.audio"
                            variant="button"
                            :size="sizeIcon"
                        />
                    </div>

                    <div
                        class="copyright-wrapper"
                        :class="{
                            'cols-2-plus': props.cols >= 2,
                        }"
                    >
                        <CopyrightIcon
                            :media="props.picture"
                            :size="sizeIcon"
                        />
                    </div>
                </div>
            </div>
        </FullScreenImage>
    </div>
</template>

<style scoped>
    .card {
        border: 0;
        align-content: space-around;
        position: relative;
    }

    .card-img {
        object-fit: cover;
        width: 100%;
        aspect-ratio: 1/1;
        display: block;
    }

    .card-title {
        color: #fff;
        font-size: 1rem;
        font-weight: 600;
        z-index: 2;
        display: flex;
        gap: 0.5em;
        align-items: center;
    }

    /* Overlay covers the image */
    .card-img-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px 20px;
    }

    .vernacularName {
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
        font-size: 1rem;
        font-weight: 600;
    }

    .bottom-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .player,
    .copyright-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
    }

    @media screen and (max-width: 1200px) {
        .card-title span {
            font-size: 1rem;
        }
    }

    /* --- Mobile --- */
    @media screen and (max-width: 768px) {
        .card-title span {
            font-size: 2rem;
        }

        .card-title span.cols-2-plus {
            font-size: 1rem;
        }

        .player.cols-2-plus,
        .copyright-wrapper.cols-2-plus {
            transform: scale(0.7);
        }

        .bottom-controls {
            padding: 0 5px;
        }
    }
</style>
