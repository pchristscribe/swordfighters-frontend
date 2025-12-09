<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Products</h1>
        <p class="mt-2 text-sm text-gray-700">
          Manage your affiliate products
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          Add Product
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="mt-6 flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search products..."
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        @input="debouncedSearch"
      />
    </div>

    <!-- Products Table -->
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table v-if="!loading && products.length > 0" class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Platform</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="product in products" :key="product.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <img class="h-10 w-10 rounded object-cover" :src="product.imageUrl" :alt="product.title" />
                      </div>
                      <div class="ml-4">
                        <div class="font-medium text-gray-900 truncate max-w-xs">{{ product.title }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ product.platform }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ product.category.name }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${{ product.price.toFixed(2) }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span :class="[
                      product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      product.status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800',
                      'inline-flex rounded-full px-2 text-xs font-semibold leading-5'
                    ]">
                      {{ product.status }}
                    </span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="loading" class="text-center py-12">
              <p class="text-gray-500">Loading products...</p>
            </div>

            <div v-if="!loading && products.length === 0" class="text-center py-12">
              <p class="text-gray-500">No products found</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination" class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> to
        <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> of
        <span class="font-medium">{{ pagination.total }}</span> results
      </div>
      <div class="flex gap-2">
        <button
          :disabled="pagination.page === 1"
          @click="loadProducts(pagination.page - 1)"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          :disabled="pagination.page === pagination.pages"
          @click="loadProducts(pagination.page + 1)"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const config = useRuntimeConfig()
const loading = ref(true)
const products = ref<any[]>([])
const pagination = ref<any>(null)
const searchQuery = ref('')

const loadProducts = async (page = 1) => {
  loading.value = true
  try {
    const data = await $fetch(`${config.public.apiBase}/api/admin/products`, {
      credentials: 'include',
      query: {
        page,
        limit: 20,
        search: searchQuery.value || undefined
      }
    })
    products.value = data.products
    pagination.value = data.pagination
  } catch (err) {
    console.error('Failed to load products:', err)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => loadProducts(1), 500)
  }
})()

onMounted(() => loadProducts())
</script>
