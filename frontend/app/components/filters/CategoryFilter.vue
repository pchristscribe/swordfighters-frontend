<script setup lang="ts">
import type { Category } from '~/types'

interface Props {
  categories: Category[]
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div>
    <label
      for="category-filter"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      Category
    </label>
    <select
      id="category-filter"
      :value="modelValue"
      @change="handleChange"
      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
    >
      <option value="">
        All Categories
      </option>
      <option
        v-for="category in categories"
        :key="category.id"
        :value="category.id"
      >
        {{ category.name }}
        <template v-if="category._count?.products">
          ({{ category._count.products }})
        </template>
      </option>
    </select>
  </div>
</template>
