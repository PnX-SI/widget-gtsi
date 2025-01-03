<script setup>
import { watch, ref, computed } from "vue";

const props = defineProps({
  itemPerPage: Number,
  pageIndex: Number,
  totalItems: Number,
});

const pageIndex = ref(props.pageIndex);
const itemsPerPage = ref(props.itemPerPage);
const totalItems = ref(props.totalItems);

watch(props, () => {
  itemsPerPage.value = props.itemPerPage;
  pageIndex.value = props.pageIndex;
  totalItems.value = props.totalItems;
});

const emit = defineEmits(["page"]);

watch(pageIndex, () => {
  emit("page", pageIndex.value);
});

function isActive(selectedPageIndex) {
  if (selectedPageIndex == pageIndex.value) {
    return "page-item active";
  } else {
    return "page-item";
  }
}
function isDisabled(pageIndex, previous = False) {
  if (previous) {
    return pageIndex == 0 ? "page-item disabled" : "page-item";
  } else {
    return pageIndex == maxNumberOfPages.value - 1
      ? "page-item disabled"
      : "page-item";
  }
}

function incrementPage() {
  if (pageIndex.value <= maxNumberOfPages.value - 1) {
    pageIndex.value++;
  }
}
function decrementPage() {
  if (pageIndex.value > 0) {
    pageIndex.value--;
  }
}
const maxNumberOfPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage.value);
});

const pageToShow = computed(() => {
  if (maxNumberOfPages.value > 5) {
    const start = pageIndex.value > 0 ? 0 : 1;
    let arange = [];
    for (let i = start; i < 5; i++) {
      arange.push(pageIndex.value + i);
    }
    return arange;
  }
  return maxNumberOfPages.value;
});
</script>

<template>
  <nav aria-label="...">
    <ul class="pagination">
      <li
        @click="pageIndex != 0 ? decrementPage() : ''"
        id="previous"
        :class="isDisabled(pageIndex, true)"
      >
        <a class="page-link">Previous</a>
      </li>
      <li
        v-for="i in pageToShow"
        :key="i"
        :class="isActive(i - 1)"
        @click="pageIndex = i - 1"
      >
        <a class="page-link">{{ i }}</a>
      </li>
      <li
        id="next"
        @click="pageIndex < maxNumberOfPages - 1 ? incrementPage() : ''"
        :class="isDisabled(pageIndex, false)"
      >
        <a class="page-link" href="#">Next</a>
      </li>
    </ul>
  </nav>
</template>
