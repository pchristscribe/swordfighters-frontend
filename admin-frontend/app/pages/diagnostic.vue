<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">WebAuthn Diagnostic Tool</h1>
        <p class="mt-2 text-gray-600">Check if your browser and system support TouchID/WebAuthn</p>
      </div>

      <div class="bg-white shadow-xl rounded-lg overflow-hidden">
        <!-- Basic Support Check -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Browser Support</h2>
          <div class="space-y-3">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span v-if="checks.webauthnSupport" class="text-green-600 text-2xl">✅</span>
                <span v-else class="text-red-600 text-2xl">❌</span>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">WebAuthn API Available</p>
                <p class="text-xs text-gray-500">window.PublicKeyCredential exists</p>
              </div>
            </div>

            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span v-if="checks.platformAuthenticator === true" class="text-green-600 text-2xl">✅</span>
                <span v-else-if="checks.platformAuthenticator === false" class="text-red-600 text-2xl">❌</span>
                <span v-else class="text-gray-400 text-2xl">⏳</span>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">Platform Authenticator (TouchID/FaceID/Windows Hello)</p>
                <p class="text-xs text-gray-500">{{ platformAuthMessage }}</p>
              </div>
            </div>

            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span v-if="checks.secureContext" class="text-green-600 text-2xl">✅</span>
                <span v-else class="text-red-600 text-2xl">❌</span>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">Secure Context (HTTPS or localhost)</p>
                <p class="text-xs text-gray-500">{{ currentOrigin }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Browser Info -->
        <div class="p-6 border-b border-gray-200 bg-gray-50">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Environment Information</h2>
          <dl class="space-y-2 text-sm">
            <div class="flex">
              <dt class="font-medium text-gray-700 w-32">Browser:</dt>
              <dd class="text-gray-900">{{ browserInfo.name }}</dd>
            </div>
            <div class="flex">
              <dt class="font-medium text-gray-700 w-32">User Agent:</dt>
              <dd class="text-gray-900 text-xs break-all">{{ browserInfo.userAgent }}</dd>
            </div>
            <div class="flex">
              <dt class="font-medium text-gray-700 w-32">Current URL:</dt>
              <dd class="text-gray-900">{{ currentUrl }}</dd>
            </div>
            <div class="flex">
              <dt class="font-medium text-gray-700 w-32">API Base:</dt>
              <dd class="text-gray-900">{{ apiBase }}</dd>
            </div>
          </dl>
        </div>

        <!-- Recommendations -->
        <div v-if="!allChecksPassed" class="p-6 bg-yellow-50">
          <h2 class="text-lg font-semibold text-yellow-900 mb-4">⚠️ Recommendations</h2>
          <ul class="space-y-2 text-sm text-yellow-800">
            <li v-if="!checks.webauthnSupport">
              • Your browser does not support WebAuthn. Try Chrome, Safari, or Edge.
            </li>
            <li v-if="checks.platformAuthenticator === false">
              • Your system does not have TouchID/FaceID/Windows Hello configured. You can still use a hardware security key (YubiKey).
            </li>
            <li v-if="!checks.secureContext">
              • You must access the admin panel via <code class="bg-yellow-100 px-1 rounded">http://localhost:3002</code>, NOT via IP address or 127.0.0.1
            </li>
          </ul>
        </div>

        <div v-else class="p-6 bg-green-50">
          <h2 class="text-lg font-semibold text-green-900 mb-2">✅ All Checks Passed!</h2>
          <p class="text-sm text-green-800">Your browser and system support WebAuthn with TouchID/FaceID.</p>
          <p class="text-sm text-green-800 mt-2">
            You can now go to the <NuxtLink to="/login" class="underline font-medium">login page</NuxtLink> and register your security key.
          </p>
        </div>

        <!-- Test Backend Connection -->
        <div class="p-6 border-t border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Backend Connection Test</h2>
          <button
            @click="testBackendConnection"
            :disabled="testing"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ testing ? 'Testing...' : 'Test Backend Connection' }}
          </button>

          <div v-if="backendTestResult" class="mt-4">
            <div v-if="backendTestResult.success" class="bg-green-50 border border-green-200 rounded-md p-4">
              <p class="text-sm text-green-800">✅ Backend is reachable at {{ apiBase }}</p>
            </div>
            <div v-else class="bg-red-50 border border-red-200 rounded-md p-4">
              <p class="text-sm text-red-800">❌ Cannot connect to backend</p>
              <p class="text-xs text-red-700 mt-1">{{ backendTestResult.error }}</p>
              <p class="text-xs text-red-700 mt-2">Make sure the backend is running: <code class="bg-red-100 px-1">cd backend && npm run dev</code></p>
            </div>
          </div>
        </div>

        <!-- Back to Login -->
        <div class="p-6 bg-gray-50 border-t border-gray-200 text-center">
          <NuxtLink
            to="/login"
            class="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Back to Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const checks = ref({
  webauthnSupport: false,
  platformAuthenticator: null as boolean | null,
  secureContext: false
})

const browserInfo = ref({
  name: '',
  userAgent: ''
})

const testing = ref(false)
const backendTestResult = ref<{ success: boolean; error?: string } | null>(null)
const currentOrigin = ref('')
const currentUrl = ref('')

const platformAuthMessage = computed(() => {
  if (checks.value.platformAuthenticator === true) {
    return 'TouchID/FaceID/Windows Hello is available'
  } else if (checks.value.platformAuthenticator === false) {
    return 'Platform authenticator not available (you can still use hardware security keys)'
  } else {
    return 'Checking...'
  }
})

const allChecksPassed = computed(() => {
  return checks.value.webauthnSupport &&
         checks.value.platformAuthenticator === true &&
         checks.value.secureContext
})

onMounted(async () => {
  // Set current URL info
  if (process.client && typeof window !== 'undefined') {
    currentOrigin.value = window.location.origin
    currentUrl.value = window.location.href
  }

  // Check WebAuthn support
  if (process.client && typeof window !== 'undefined' && window.PublicKeyCredential) {
    checks.value.webauthnSupport = true

    // Check for platform authenticator (TouchID, FaceID, Windows Hello)
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      checks.value.platformAuthenticator = available
    } catch (err) {
      console.error('Error checking platform authenticator:', err)
      checks.value.platformAuthenticator = false
    }
  }

  // Check secure context
  if (process.client && typeof window !== 'undefined') {
    checks.value.secureContext = window.isSecureContext
  }

  // Get browser info
  if (process.client && typeof navigator !== 'undefined') {
    browserInfo.value.userAgent = navigator.userAgent
    browserInfo.value.name = getBrowserName(navigator.userAgent)
  }
})

function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Edg')) return 'Microsoft Edge'
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
  return 'Unknown'
}

async function testBackendConnection() {
  testing.value = true
  backendTestResult.value = null

  try {
    const response = await $fetch(`${apiBase}/health`, {
      method: 'GET'
    })
    backendTestResult.value = { success: true }
  } catch (err: any) {
    backendTestResult.value = {
      success: false,
      error: err.message || 'Connection failed'
    }
  } finally {
    testing.value = false
  }
}
</script>
