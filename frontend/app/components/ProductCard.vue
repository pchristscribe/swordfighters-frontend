<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types'

interface Props {
  product: Product
}

const props = defineProps<Props>()

const formattedPrice = computed(() => {
  return `$${props.product.price.toFixed(2)}`
})

const hasRating = computed(() => {
  return props.product.rating && props.product.reviewCount > 0
})
</script>

<template>
  <article
    class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    :aria-label="`Product: ${product.title}`"
  >
    <NuxtLink :to="`/products/${product.id}`" class="block">
      <!-- Product Image -->
      <div class="relative">
        <img
          :src="product.imageUrl"
          :alt="product.title"
          class="w-full h-48 object-cover"
          loading="lazy"
        />

        <!-- Affiliate Disclosure Badge -->
        <div
          class="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-sm"
          title="This is an affiliate link. We may earn a commission from purchases."
          role="note"
          aria-label="Affiliate product"
        >
          Affiliate
        </div>
      </div>

      <!-- Product Details -->
      <div class="p-4">
        <!-- Platform and Price -->
        <div class="flex items-center justify-between mb-2">
          <span
            class="inline-block px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-800"
            :aria-label="`Available on ${product.platform}`"
          >
            {{ product.platform }}
          </span>
          <span class="text-lg font-bold text-gray-900" :aria-label="`Price: ${formattedPrice}`">
            {{ formattedPrice }}
          </span>
        </div>

        <!-- Product Title -->
        <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">
          {{ product.title }}
        </h3>

        <!-- Product Description -->
        <p class="text-sm text-gray-600 line-clamp-2 mb-3">
          {{ product.description }}
        </p>

        <!-- Category and Rating -->
        <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span v-if="product.category">{{ product.category.name }}</span>
          <span v-if="hasRating" class="flex items-center gap-1">
            <span aria-hidden="true">⭐</span>
            <span class="sr-only">Rating:</span>
            {{ product.rating?.toFixed(1) }}
            <span class="text-gray-400">({{ product.reviewCount }})</span>
          </span>
        </div>

        <!-- Add to Cart Button -->
        <button
          type="button"
          class="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          :aria-label="`Add ${product.title} to cart`"
          @click.prevent="$emit('add-to-cart', product)"
        >
          Add to Cart
        </button>
      </div>
    </NuxtLink>
  </article>
</template>
