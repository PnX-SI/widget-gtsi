<script setup>
    import { ref, watch, computed } from 'vue';
    import ParameterStore from '@/lib/parameterStore';

    const { primaryColor } = ParameterStore.getInstance();

    const props = defineProps({
        progress: {
            type: Number,
            default: 0,
            validator: (value) => value >= 0 && value <= 100,
        },
        message: {
            type: String,
            default: '',
        },
    });

    const currentProgress = ref(props.progress);

    watch(
        () => props.progress,
        (newVal) => {
            currentProgress.value = newVal;
        }
    );

    const progressWidth = computed(() => `${currentProgress.value}%`);
    const primaryColorHex = computed(() =>
        primaryColor.value ? `#${primaryColor.value}` : '#444444'
    );
</script>

<template>
    <div class="progress-container" data-testid="ProgressBar component">
        <div class="progress-card">
            <div class="progress-bar-wrapper">
                <div class="progress-bar-background">
                    <div
                        class="progress-bar-fill"
                        :style="{ width: progressWidth }"
                    ></div>
                </div>
            </div>
            <p v-if="message" class="progress-message">{{ message }}</p>
        </div>
    </div>
</template>

<style scoped>
    .progress-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 60px 0;
    }

    .progress-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #ffffff;
        border-radius: 18px;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        padding: 30px 50px;
        transition: all 0.3s ease;
        min-width: 320px;
        max-width: 500px;
    }

    .progress-bar-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .progress-bar-background {
        width: 100%;
        height: 24px;
        background: linear-gradient(to right, #f0f0f0, #e8e8e8);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        position: relative;
    }

    .progress-bar-fill {
        height: 100%;
        background: v-bind(primaryColorHex);
        border-radius: 12px;
        transition: width 0.3s ease;
        box-shadow: 0 2px 8px v-bind('primaryColorHex + "4D"');
        position: relative;
    }

    .progress-message {
        margin-top: 16px;
        margin-bottom: 0;
        font-size: 1rem;
        font-weight: 500;
        color: #666;
        text-align: center;
        letter-spacing: 0.3px;
    }

    @media (max-width: 576px) {
        .progress-card {
            min-width: 280px;
            padding: 25px 35px;
        }

        .progress-percentage {
            font-size: 1rem;
        }

        .progress-message {
            font-size: 0.9rem;
        }
    }
</style>
