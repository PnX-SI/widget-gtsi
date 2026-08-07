<script setup>
    import { reactive, ref, watch } from 'vue';

    import ParameterStore from '@/lib/parameterStore';
    import { getConnector } from '@/lib/connectors/utils';
    import { GeoNatureConnector } from '@/lib/connectors/geonature';
    import { GbifConnector } from '@/lib/connectors/gbif';
    import { GbifFacetConnector } from '@/lib/connectors/gbiffacet';
    import { CONNECTORS } from '@/lib/connectors/connectors';

    const props = defineProps({
        variant: {
            type: String,
            default: 'primary',
        },
    });

    const { connector } = ParameterStore.getInstance();

    const sourcesParams = {
        [CONNECTORS.GBIF]: new GbifConnector().getParamsSchema(),
        [CONNECTORS.GeoNature]: new GeoNatureConnector().getParamsSchema(),
        [CONNECTORS.GBIF_FACET]: new GbifFacetConnector().getParamsSchema(),
    };

    const sourceName = ref(connector.value.name);
    let params = reactive(
        Object.fromEntries(
            sourcesParams[sourceName.value].map((form) => [
                form.name,
                connector.value[form.name] || form.default,
            ])
        )
    );

    watch([sourceName], () => {
        params = reactive(
            Object.fromEntries(
                sourcesParams[sourceName.value].map((form) => [
                    form.name,
                    form.default,
                ])
            )
        );
    });

    function updateSource(a) {
        connector.value = getConnector(sourceName.value, params);
    }
</script>

<template>
    <div class="text-center col-12">
        <BButton
            v-b-modal.modal-center
            :variant="props.variant"
            size="md"
            data-testid="button to open the source change modal"
            aria-label="button to open the source change modal"
            class="col-12 mb-3"
            ><i class="fa fa-leaf"></i> {{ $t('source.modify') }} ({{
                sourceName
            }})</BButton
        >
    </div>

    <BModal
        id="modal-center"
        centered
        :title="$t('source.title')"
        @ok="updateSource"
    >
        <div class="sourceParam">
            <label for="sourceName"> {{ $t('source.select') }}</label>
            <select
                v-model="sourceName"
                class="form-select"
                data-testid="Source selection select form"
            >
                <option
                    v-for="(source, sourceName) in sourcesParams"
                    :value="sourceName"
                >
                    {{ sourceName }}
                </option>
            </select>
            <div class="parameters" v-for="form in sourcesParams[sourceName]">
                <label :for="form.name">{{ form.label }}</label>
                <input
                    v-if="form.type === String"
                    class="form-control"
                    :placeholder="form.default"
                    v-model="params[form.name]"
                />
                <input
                    v-else-if="form.type === Number"
                    :type="form.type"
                    class="form-control"
                    :placeholder="form.default"
                    v-model="params[form.name]"
                />
                <select
                    v-else-if="Array.isArray(form.type)"
                    class="form-select"
                    v-model="params[form.name]"
                >
                    <option
                        v-for="option in form.values"
                        :key="option"
                        :value="option"
                    >
                        {{ option }}
                    </option>
                </select>
                <div v-else class="text-danger">Unsupported input type</div>
            </div>
        </div>
    </BModal>
</template>

<style></style>
