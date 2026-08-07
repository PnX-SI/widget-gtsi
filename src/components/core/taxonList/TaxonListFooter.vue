<script setup>
    import { ref, computed, useTemplateRef } from 'vue';
    import ParameterStore from '@/lib/parameterStore';
    import DatasetList from './DatasetList.vue';
    import { useMutationObserver } from '@vueuse/core';

    const parameterStore = ParameterStore.getInstance();
    const { connector, primaryColor, expandedFooterSize, isFooterExpanded } =
        parameterStore;

    const props = defineProps({
        loadingDone: {
            type: Boolean,
        },
        numberOfSpecies: {
            type: Number,
        },
        datasets: {
            type: Array,
        },
    });

    const footerElement = useTemplateRef('data-source-credits');

    /**
     * Check if there is expandable content in the footer
     */
    const hasExpandableContent = computed(() => {
        return (
            connector.value.sourceDetailMessage() ||
            (props.datasets && props.datasets.length > 0)
        );
    });

    /**
     * Toggle mechanism for expanding/collapsing the footer content
     */
    const toggleExpand = () => {
        if (hasExpandableContent.value) {
            isFooterExpanded.value = !isFooterExpanded.value;
        }
    };

    /**
     * Watch for changes in the footer
     * and update the expandedFooterSize in the parameter store accordingly
     */
    useMutationObserver(
        () => footerElement.value,
        (mutations) => {
            expandedFooterSize.value = footerElement.value
                ? footerElement.value.scrollHeight
                : 0;
        },
        {
            attributes: true,
            subtree: true,
        }
    );
    const versionTooltipAnchor = ref(null);
    const VERSION = __APP_VERSION__;
    const COMMIT_HASH = __COMMIT_HASH__;
</script>

<template>
    <div class="footer-wrapper">
        <div
            v-if="props.loadingDone"
            id="data-source-credits"
            data-testid="Data source credits"
            :style="{ color: '#' + primaryColor }"
            :class="{ expanded: isFooterExpanded }"
            ref="data-source-credits"
        >
            <div
                class="footer-header"
                :class="{ 'not-expandable': !hasExpandableContent }"
                @click="toggleExpand"
            >
                <div class="footer-main-content">
                    <FloatingTooltip :anchor="versionTooltipAnchor" :offset="8">
                        Powered by
                        <a
                            href="https://si.ecrins-parcnational.com/blog/2025-08-BAM-widget-en.html"
                            target="_blank"
                            >BAM (Biodiversity Around Me)</a
                        >
                        <br />
                        Version : {{ VERSION }} ({{ COMMIT_HASH }})
                    </FloatingTooltip>
                    <span class="bam-logo-link" ref="versionTooltipAnchor">
                        <img
                            src="https://geonature.fr/documents/autres/BAM/BAM-logo.png"
                            height="24px"
                            alt="BAM logo"
                        />
                    </span>
                    <span class="species-count">
                        <strong>{{ props.numberOfSpecies }}</strong>
                        {{ $t('taxon.taxonFound') }}
                    </span>
                    <span class="separator">•</span>
                    <span class="source-info">
                        {{ $t('source.source') }}
                        <a
                            v-if="connector.getSourceUrl()"
                            :href="connector.getSourceUrl()"
                            target="_blank"
                            class="source-link"
                            @click.stop
                        >
                            {{ connector.getSourceName() }}
                        </a>
                        <strong v-else>{{ connector.getSourceName() }}</strong>
                        <span class="separator">•</span>
                        <ShareButton />
                    </span>
                </div>
                <button
                    v-if="hasExpandableContent"
                    class="expand-toggle"
                    :class="{ rotated: isFooterExpanded }"
                >
                    <i class="bi bi-chevron-up"></i>
                </button>
            </div>

            <transition name="fade">
                <div class="footer-expanded-content" v-show="isFooterExpanded">
                    <div
                        v-if="connector.sourceDetailMessage()"
                        class="source-detail-message"
                    >
                        <i class="bi bi-info-circle me-2"></i>
                        {{ connector.sourceDetailMessage() }}
                    </div>
                    <div
                        class="how-to-contribute"
                        v-if="connector.howToContributeMessage()"
                    >
                        <i class="bi bi-node-plus"></i>
                        <div>
                            <strong>{{ $t('source.howToContribute') }}</strong>
                            <VueShowdown
                                :markdown="connector.howToContributeMessage()"
                            />
                        </div>
                    </div>
                    <DatasetList
                        v-if="props.datasets.length > 0"
                        :datasets="props.datasets"
                    ></DatasetList>
                </div>
            </transition>
        </div>
    </div>
</template>

<style scoped>
    .footer-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
    }

    #data-source-credits {
        background: white;
        width: 100%;
        overflow: hidden;
        transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        border-top: 1px solid #bdc3c7;
        border-radius: 15px 15px 0 0;
    }

    #data-source-credits:not(.expanded) {
        max-height: 6em;
    }

    #data-source-credits.expanded {
        max-height: 500px;
        overflow-y: auto;
    }

    .footer-header {
        padding: 6px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        cursor: pointer;
        user-select: none;
    }

    .footer-header.not-expandable {
        cursor: default;
    }

    .footer-main-content {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        flex: 1;
        justify-content: center;
    }

    .bam-logo-link {
        display: inline-flex;
        align-items: center;
        margin-right: 4px;
    }

    .species-count {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .separator {
        color: #999;
        margin: 0 6px;
        font-size: 0.9em;
    }

    .source-info {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .source-link {
        font-weight: 500;
    }

    .expand-toggle {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
        font-size: 1.2em;
        flex-shrink: 0;
    }

    .expand-toggle:hover {
        opacity: 0.7;
    }

    .expand-toggle.rotated {
        transform: rotate(180deg);
    }

    .footer-expanded-content {
        padding: 0 20px 12px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

    .source-detail-message,
    .how-to-contribute {
        padding: 10px;
        background: #f8f9fa;
        border-radius: 6px;
        display: flex;
        align-items: flex-start;
        font-size: 0.9em;
        line-height: 1.4;
        gap: 8px;
    }
    .how-to-contribute i {
        font-size: 1em;
    }

    #data-source-credits a {
        text-decoration: underline;
        transition: opacity 0.3s ease;
        color: inherit;
    }

    #data-source-credits a:hover {
        opacity: 0.7;
    }

    #data-source-credits img {
        transition: transform 0.3s ease;
        vertical-align: middle;
    }

    #data-source-credits img:hover {
        transform: scale(1.05);
    }

    #data-source-credits i {
        color: inherit;
    }

    @media (max-width: 500px) {
        .footer-header {
            padding: 4px 8px;
            font-size: 1rem;
        }

        .footer-main-content {
            gap: 3px;
        }

        .footer-expanded-content {
            padding: 0 16px 10px 16px;
        }

        .expand-toggle {
            font-size: 1.4em;
            margin-right: 0.5em;
        }
    }
</style>
