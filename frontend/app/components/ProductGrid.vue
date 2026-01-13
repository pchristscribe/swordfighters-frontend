<script setup lang="ts">
import type { Product } from '~/types'

interface Props {
  products: Product[]
  loading?: boolean
}

defineProps<Props>()

const formatPrice = (price: number): string => {
  return price.toFixed(2)
}

const formatRating = (rating?: number): string => {
  return rating ? rating.toFixed(1) : '0.0'
}
</script>

<template>
  <div>
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <!-- Loading skeleton -->
      <div
        v-for="i in 8"
        :key="i"
        class="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
      >
        <div class="w-full h-48 bg-gray-200" />
        <div class="p-4 space-y-3">
          <div class="h-4 bg-gray-200 rounded w-1/3" />
          <div class="h-4 bg-gray-200 rounded w-full" />
          <div class="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>

    <div
      v-else-if="products.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <NuxtLink
        v-for="product in products"
        :key="product.id"
        :to="`/products/${product.id}`"
        class="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200"
      >
        <!-- Product Image -->
        <div class="relative overflow-hidden bg-gray-100">
          <img
            :src="product.imageUrl"
            :alt="product.title"
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          >
          <div class="absolute top-2 left-2">
            <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
              {{ product.platform }}
            </span>
          </div>
        </div>

        <!-- Product Details -->
        <div class="p-4">
          <!-- Price and Rating -->
          <div class="flex items-start justify-between mb-2">
            <span class="text-xl font-bold text-gray-900">
              ${{ formatPrice(product.price) }}
            </span>
            <div
              v-if="product.rating && product.reviewCount > 0"
              class="flex items-center gap-1 text-sm"
            >
              <span class="text-yellow-500">⭐</span>
              <span class="font-medium text-gray-700">
                {{ formatRating(product.rating) }}
              </span>
              <span class="text-gray-400">
                ({{ product.reviewCount }})
              </span>
            </div>
          </div>

          <!-- Title -->
          <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {{ product.title }}
          </h3>

          <!-- Description -->
          <p class="text-sm text-gray-600 line-clamp-2 mb-3">
            {{ product.description }}
          </p>

          <!-- Category -->
          <div class="flex items-center justify-between">
            <span
              v-if="product.category"
              class="text-xs font-medium text-gray-500"
            >
              {{ product.category.name }}
            </span>
            <span class="text-xs font-medium text-indigo-600 group-hover:text-indigo-700">
              View Details →
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-16"
    >
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        No products found
      </h3>
      <p class="text-gray-600 mb-6">
        Try adjusting your filters to find what you're looking for
      </p>
    </div>
  </div>
</template>
