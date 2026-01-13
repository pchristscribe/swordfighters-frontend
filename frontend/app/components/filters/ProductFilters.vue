<script setup lang="ts">
import type { Category } from '~/types'

interface Props {
  categories: Category[]
}

interface Emits {
  (e: 'apply'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const filterStore = useFilterStore()

// Watch for filter changes and emit apply event
const applyFilters = () => {
  emit('apply')
}

const handleClearAll = () => {
  filterStore.clearAllFilters()
  applyFilters()
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold text-gray-900">
            Filters
          </h2>
          <span
            v-if="filterStore.activeFiltersCount > 0"
            class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
          >
            {{ filterStore.activeFiltersCount }} active
          </span>
        </div>
        <button
          v-if="filterStore.hasActiveFilters"
          type="button"
          @click="handleClearAll"
          class="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="p-6 space-y-6">
      <!-- Category Filter -->
      <CategoryFilter
        v-model="filterStore.categoryId"
        :categories="categories"
        @update:model-value="applyFilters"
      />

      <!-- Price Range Filter -->
      <PriceRangeFilter
        :min="filterStore.minPrice"
        :max="filterStore.maxPrice"
        @update="(min, max) => {
          filterStore.setPriceRange(min, max)
          applyFilters()
        }"
      />

      <!-- Rating Filter -->
      <RatingFilter
        v-model="filterStore.minRating"
        @update:model-value="applyFilters"
      />
    </div>
  </div>
</template>
