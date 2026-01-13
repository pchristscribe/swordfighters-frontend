<script setup lang="ts">
import { RATING_OPTIONS } from '../../types/filters'

interface Props {
  modelValue: number
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const renderStars = (count: number) => {
  return '⭐'.repeat(count)
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Minimum Rating
    </label>
    <div class="space-y-2">
      <button
        v-for="option in RATING_OPTIONS"
        :key="option.value"
        type="button"
        @click="emit('update:modelValue', option.value)"
        class="w-full px-4 py-2.5 text-left border rounded-lg transition-all"
        :class="
          modelValue === option.value
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        "
      >
        <div class="flex items-center justify-between">
          <span class="text-sm">{{ option.label }}</span>
          <span v-if="option.stars > 0" class="text-base">
            {{ renderStars(Math.floor(option.stars)) }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
