<script setup lang="ts">
import { ref } from 'vue'
import type { Product } from '~/types'
import SearchBar from '~/components/SearchBar.vue'

const selectedProduct = ref<Product | null>(null)
const searchHistory = ref<string[]>([])

const handleSelect = (product: Product) => {
  selectedProduct.value = product
  console.log('Selected product:', product)
}

const handleSearch = (query: string) => {
  if (!searchHistory.value.includes(query)) {
    searchHistory.value.unshift(query)
  }
  console.log('Search performed:', query)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-3xl">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900">
          SearchBar Component Demo
        </h1>
        <p class="mt-2 text-gray-600">
          Production-ready search with autocomplete
        </p>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-md">
        <SearchBar
          placeholder="Search for products..."
          :debounce-ms="300"
          :min-chars="2"
          :max-results="10"
          @select="handleSelect"
          @search="handleSearch"
        />
      </div>

      <div v-if="selectedProduct" class="mt-6 rounded-lg bg-white p-6 shadow-md">
        <h2 class="mb-4 text-xl font-semibold text-gray-900">
          Selected Product
        </h2>
        <div class="flex gap-4">
          <img
            v-if="selectedProduct.imageUrl"
            :src="selectedProduct.imageUrl"
            :alt="selectedProduct.title"
            class="h-24 w-24 rounded object-cover"
          >
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900">
              {{ selectedProduct.title }}
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ selectedProduct.description }}
            </p>
            <div class="mt-2 flex items-center gap-4">
              <span class="text-lg font-bold text-blue-600">
                ${{ selectedProduct.price }}
              </span>
              <span class="text-sm text-gray-500 uppercase">
                {{ selectedProduct.platform }}
              </span>
              <span v-if="selectedProduct.rating" class="flex items-center gap-1 text-sm">
                <svg class="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {{ selectedProduct.rating.toFixed(1) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="searchHistory.length > 0" class="mt-6 rounded-lg bg-white p-6 shadow-md">
        <h2 class="mb-4 text-xl font-semibold text-gray-900">
          Search History
        </h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(query, index) in searchHistory.slice(0, 10)"
            :key="index"
            class="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
          >
            {{ query }}
          </span>
        </div>
      </div>

      <div class="mt-8 rounded-lg bg-gray-100 p-6">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">
          Features
        </h2>
        <ul class="space-y-2 text-sm text-gray-700">
          <li class="flex items-start gap-2">
            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Debounced search (300ms) - prevents excessive API calls</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Full keyboard navigation (Arrow keys, Enter, Escape, Tab)</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Accessible (ARIA attributes, screen reader support)</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Loading states and error handling</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>TypeScript with full type safety</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>28 comprehensive unit tests (100% coverage of critical paths)</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Click outside to close, focus management</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Edge case handling (empty states, no images, network errors)</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
