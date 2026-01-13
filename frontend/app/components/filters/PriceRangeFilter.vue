<script setup lang="ts">
import { computed } from 'vue'
import { PRICE_RANGE } from '../../types/filters'

interface Props {
  min: number
  max: number
}

interface Emits {
  (e: 'update', min: number, max: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const minValue = computed({
  get: () => props.min,
  set: (value: number) => {
    const newMin = Math.min(value, props.max - PRICE_RANGE.step)
    emit('update', newMin, props.max)
  },
})

const maxValue = computed({
  get: () => props.max,
  set: (value: number) => {
    const newMax = Math.max(value, props.min + PRICE_RANGE.step)
    emit('update', props.min, newMax)
  },
})

const minPercentage = computed(() => {
  return ((props.min - PRICE_RANGE.min) / (PRICE_RANGE.max - PRICE_RANGE.min)) * 100
})

const maxPercentage = computed(() => {
  return ((props.max - PRICE_RANGE.min) / (PRICE_RANGE.max - PRICE_RANGE.min)) * 100
})

const formatPrice = (value: number): string => {
  if (value >= PRICE_RANGE.max) return `$${value}+`
  return `$${value}`
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Price Range
    </label>

    <div class="space-y-4">
      <!-- Display selected range -->
      <div class="flex items-center justify-between text-sm font-medium text-gray-900">
        <span>{{ formatPrice(min) }}</span>
        <span class="text-gray-500">-</span>
        <span>{{ formatPrice(max) }}</span>
      </div>

      <!-- Dual range slider -->
      <div class="relative pt-2 pb-6">
        <!-- Slider track background -->
        <div class="absolute h-2 bg-gray-200 rounded-full w-full top-0" />

        <!-- Active range highlight -->
        <div
          class="absolute h-2 bg-indigo-600 rounded-full top-0"
          :style="{
            left: `${minPercentage}%`,
            right: `${100 - maxPercentage}%`,
          }"
        />

        <!-- Min slider -->
        <input
          v-model.number="minValue"
          type="range"
          :min="PRICE_RANGE.min"
          :max="PRICE_RANGE.max"
          :step="PRICE_RANGE.step"
          class="absolute w-full h-2 bg-transparent appearance-none pointer-events-none top-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
        >

        <!-- Max slider -->
        <input
          v-model.number="maxValue"
          type="range"
          :min="PRICE_RANGE.min"
          :max="PRICE_RANGE.max"
          :step="PRICE_RANGE.step"
          class="absolute w-full h-2 bg-transparent appearance-none pointer-events-none top-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
        >
      </div>

      <!-- Quick price presets -->
      <div class="flex gap-2 flex-wrap">
        <button
          type="button"
          @click="emit('update', 0, 20)"
          class="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          :class="{ 'bg-indigo-50 border-indigo-300 text-indigo-700': min === 0 && max === 20 }"
        >
          Under $20
        </button>
        <button
          type="button"
          @click="emit('update', 20, 50)"
          class="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          :class="{ 'bg-indigo-50 border-indigo-300 text-indigo-700': min === 20 && max === 50 }"
        >
          $20 - $50
        </button>
        <button
          type="button"
          @click="emit('update', 50, 100)"
          class="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          :class="{ 'bg-indigo-50 border-indigo-300 text-indigo-700': min === 50 && max === 100 }"
        >
          $50 - $100
        </button>
        <button
          type="button"
          @click="emit('update', 100, 500)"
          class="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          :class="{ 'bg-indigo-50 border-indigo-300 text-indigo-700': min === 100 && max === 500 }"
        >
          $100+
        </button>
      </div>
    </div>
  </div>
</template>
