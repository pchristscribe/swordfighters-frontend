<script setup lang="ts">
import type { Pagination as PaginationType } from '~/types'

interface Props {
  pagination: PaginationType
}

interface Emits {
  (e: 'change', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visiblePages = computed(() => {
  const { page, pages } = props.pagination
  const delta = 2
  const range: number[] = []
  const rangeWithDots: (number | string)[] = []

  for (
    let i = Math.max(2, page - delta);
    i <= Math.min(pages - 1, page + delta);
    i++
  ) {
    range.push(i)
  }

  if (page - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (page + delta < pages - 1) {
    rangeWithDots.push('...', pages)
  } else if (pages > 1) {
    rangeWithDots.push(pages)
  }

  return rangeWithDots
})

const handlePageChange = (page: number) => {
  if (page !== props.pagination.page && page >= 1 && page <= props.pagination.pages) {
    emit('change', page)
  }
}
</script>

<template>
  <div
    v-if="pagination.pages > 1"
    class="flex items-center justify-center gap-2"
  >
    <!-- Previous Button -->
    <button
      type="button"
      @click="handlePageChange(pagination.page - 1)"
      :disabled="pagination.page === 1"
      class="px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :class="
        pagination.page === 1
          ? 'border-gray-200 text-gray-400'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      "
    >
      Previous
    </button>

    <!-- Page Numbers -->
    <div class="flex items-center gap-1">
      <template
        v-for="(page, index) in visiblePages"
        :key="index"
      >
        <button
          v-if="typeof page === 'number'"
          type="button"
          @click="handlePageChange(page)"
          class="min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-colors"
          :class="
            page === pagination.page
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
          "
        >
          {{ page }}
        </button>
        <span
          v-else
          class="px-2 text-gray-400"
        >
          {{ page }}
        </span>
      </template>
    </div>

    <!-- Next Button -->
    <button
      type="button"
      @click="handlePageChange(pagination.page + 1)"
      :disabled="pagination.page === pagination.pages"
      class="px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :class="
        pagination.page === pagination.pages
          ? 'border-gray-200 text-gray-400'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      "
    >
      Next
    </button>
  </div>
</template>
