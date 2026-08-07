<script setup>
    import { computed, ref } from 'vue';

    const isLinkCopied = ref(false);

    /**
     * Copy the current widget URL to the clipboard (or use native share on mobile)
     * to share the current search state, which is fully encoded in the URL.
     */
    const shareSearch = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ url });
            } catch (e) {
                // user cancelled the native share sheet, do nothing
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            isLinkCopied.value = true;
            setTimeout(() => {
                isLinkCopied.value = false;
            }, 2000);
        } catch (e) {
            console.error('Failed to copy share link', e);
        }
    };
</script>

<template>
    <button
        class="share-button"
        :class="{ copied: isLinkCopied }"
        :aria-label="$t('share.share')"
        @click.stop="shareSearch"
    >
        <i :class="isLinkCopied ? 'bi bi-check2' : 'bi bi-share'"></i>
        <span class="share-label">
            {{ isLinkCopied ? $t('copied') : $t('share') }}
        </span>
    </button>
    <button
        v-if="hasExpandableContent"
        class="expand-toggle"
        :class="{ rotated: isFooterExpanded }"
    >
        <i class="bi bi-chevron-up"></i>
    </button>
</template>

<style>
    .share-button {
        background: none;
        border: 1px solid #bdc3c7;
        border-radius: 10px;
        color: inherit;
        cursor: pointer;
        padding: 4px 10px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85em;
        flex-shrink: 0;
        transition:
            opacity 0.2s ease,
            background 0.2s ease;
    }

    .share-button:hover {
        opacity: 0.7;
    }

    @media (max-width: 500px) {
        .share-label {
            display: none;
        }

        .share-button {
            padding: 4px 8px;
        }
    }
</style>
