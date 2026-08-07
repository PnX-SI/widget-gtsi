<script setup lang="ts">
    import CopyrightIcon from '@/components/commons/CopyrightIcon.vue';
    import { Media } from '@/lib/models';
    import ParameterStore from '@/lib/parameterStore';
    import { StatusInfo } from './interface';

    const { connector, primaryColor } = ParameterStore.getInstance();
    const props = defineProps<{
        picture: Media;
        audio: Media;
        vernacularName: string;
        acceptedScientificName: string;
        urlDetailPage: string;
        nbObservations: number;
        lastSeenDate: Date;
        status: StatusInfo;
    }>();
</script>
<template>
    <div class="detailed" data-testid="Taxon detailed view">
        <div class="image-container">
            <FullScreenImage
                :media="props.picture"
                :alt="props.picture?.urlSource"
            >
                <Image
                    :imageUrl="props.picture?.url"
                    :alt="props.picture?.urlSource"
                    testID="Taxon picture"
                />
            </FullScreenImage>
            <AudioPlayer
                v-if="props.audio?.url"
                :audio="props.audio"
                variant="button"
                :size="45"
                class="audio-overlay"
            ></AudioPlayer>
            <CopyrightIcon
                :media="props.picture"
                class="copyright-overlay"
                :size="20"
            />
        </div>
        <div class="names">
            <div class="vernacular-name">
                <StatusIcon
                    v-if="props.status?.status"
                    :status="props.status.status"
                    :color="props.status.color"
                    :size="'1.2rem'"
                ></StatusIcon>
                <strong data-testid="Vernacular name">{{
                    props.vernacularName
                }}</strong>
            </div>
            <em data-testid="Scientific name">{{
                props.acceptedScientificName
            }}</em>
        </div>

        <div class="statistics-wrapper">
            <div class="statistics">
                <span
                    >{{ $t('taxon.observed') }} <br />
                    <strong data-testid="Number of observations">{{
                        props.nbObservations
                    }}</strong>
                    {{ $t('taxon.times') }}</span
                >
            </div>
            <div class="statistics">
                <span
                    >{{ $t('taxon.lastSeen') }} <br />
                    <strong data-testid="Last seen date">{{
                        props.lastSeenDate.toLocaleDateString()
                    }}</strong></span
                >
            </div>
        </div>
        <a
            :href="props.urlDetailPage"
            target="_blank"
            class="detail-button"
            data-testid="Taxon detail redirect link"
        >
            {{ $t('taxon.learnMore') }}
            <i class="bi bi-box-arrow-up-right"></i>
        </a>
    </div>
</template>
<style scoped>
    .detailed {
        container-name: detailed;
        container-type: inline-size;
        border: 1px solid #efefef;
        display: flex;
        justify-content: start;
        flex-direction: column;
        border-radius: 10px;
        padding-bottom: 1em;
    }

    .image-container {
        margin-top: 0;
        margin-bottom: 1.5em;
        position: relative;
        display: flex;
        justify-content: center;
    }

    .audio-overlay {
        position: absolute;
        bottom: 0px;
        left: 50%;
        transform: translateX(-50%) translateY(50%);
        z-index: 2;
    }

    .copyright-overlay {
        position: absolute;
        bottom: 10px;
        right: 10px;
        z-index: 2;
        width: auto;
    }

    .audio-overlay {
        width: auto;
    }

    .image-container > :not(.audio-overlay):not(.copyright-overlay) {
        width: 100%;
    }

    :deep(.image-wrapper) {
        border-radius: 10px 10px 0px 0px;
        -webkit-border-radius: 10px 10px 0px 0px;
        -moz-border-radius: 10px 10px 0px 0px;
    }

    :deep(.image-wrapper img) {
        border-radius: 10px 10px 0px 0px;
        -webkit-border-radius: 10px 10px 0px 0px;
        -moz-border-radius: 10px 10px 0px 0px;
    }

    .statistics-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        margin-top: 1em;
        column-gap: 0.5em;
    }
    .statistics {
        display: flex;
        flex-direction: column;
        color: #666;
        text-align: center;
        strong {
            color: #444;
        }
    }
    .names {
        text-align: center;
        display: flex;
        flex-direction: column;
        strong {
            font-size: 1.2em;
        }
        em {
            color: #888;
        }
        .vernacular-name {
            display: flex;
            flex-direction: row;
            gap: 0.5em;
            align-items: center;
            align-self: center;
            padding-right: 0.5em;
            padding-left: 0.5em;
        }
    }

    .detail-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5em;
        margin: 1em auto 0;
        padding: 0.4em 0.8em;
        background-color: transparent;
        color: v-bind('"#" + primaryColor');
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
        font-size: 0.75rem;
        transition: all 0.2s ease;
        border: 1px solid v-bind('"#" + primaryColor');
        cursor: pointer;
    }

    .detail-button:hover {
        background-color: v-bind('"#" + primaryColor');
        color: white;
    }

    .detail-button i {
        font-size: 0.85rem;
    }

    @container detailed (width < 275px) {
        .statistics-wrapper {
            flex-direction: column;
            row-gap: 0.5em;
        }
        .statistics {
            width: 100%;
        }
    }
</style>
