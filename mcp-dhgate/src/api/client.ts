import { CONFIG } from '../config.js'
import type { Product, SearchResult, ApiResponse, RateLimitState } from '../types.js'
import { mapApiError, handleNetworkError, DHgateAPIError } from '../utils/errors.js'

export class DHgateAPIClient {
  private rateLimitState: RateLimitState = {
    requests: 0,
    resetTime: Date.now() + 60000
  }

  private async throttle(): Promise<void> {
    const now = Date.now()

    if (now >= this.rateLimitState.resetTime) {
      this.rateLimitState = {
        requests: 0,
        resetTime: now + 60000
      }
    }

    if (this.rateLimitState.requests >= CONFIG.rateLimit) {
      const waitTime = this.rateLimitState.resetTime - now
      throw new DHgateAPIError(
        'Rate limit exceeded',
        'RATE_LIMIT',
        `Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request.`
      )
    }

    this.rateLimitState.requests++
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    await this.throttle()

    const url = new URL(`${CONFIG.apiBaseUrl}${endpoint}`)
    url.searchParams.append('apiToken', CONFIG.apiToken)

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), CONFIG.apiTimeout)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MCP-DHgate/1.0'
        },
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw mapApiError(response.status, errorText)
      }

      const data = await response.json() as T

      return {
        success: true,
        data
      }
    } catch (error) {
      if (error instanceof DHgateAPIError) {
        throw error
      }

      if (error instanceof Error) {
        throw handleNetworkError(error)
      }

      throw new DHgateAPIError(
        'Unknown error occurred',
        'UNKNOWN_ERROR',
        'An unexpected error occurred. Please try again.'
      )
    }
  }

  async searchProducts(params: {
    keywords: string
    page?: number
    sort?: string
    country?: string
    currency?: string
    language?: string
    free_shipping?: boolean
    high_rating?: boolean
  }): Promise<SearchResult> {
    const response = await this.makeRequest<{
      total: number
      page: number
      items: RawProduct[]
    }>('/search', params)

    if (!response.data) {
      throw new DHgateAPIError(
        'No data returned from API',
        'NO_DATA',
        'The API did not return any data. Please try again.'
      )
    }

    const products = response.data.items.map(transformProduct)

    return {
      totalResults: response.data.total || 0,
      page: response.data.page || params.page || 1,
      products,
      hasMore: products.length === CONFIG.maxProductsPerPage
    }
  }

  async getProductDetails(productId: string): Promise<Product> {
    const response = await this.makeRequest<{ item: RawProduct }>('/product', { id: productId })

    if (!response.data?.item) {
      throw new DHgateAPIError(
        `Product not found: ${productId}`,
        'NOT_FOUND',
        'The requested product could not be found. Please verify the product ID is correct.'
      )
    }

    return transformProduct(response.data.item)
  }
}

interface RawProduct {
  itemCode?: string
  productId?: string
  title?: string
  itemTitle?: string
  price?: number
  salePrice?: number
  currency?: string
  itemUrl?: string
  productUrl?: string
  itemImage?: string
  imageUrl?: string
  rating?: number
  reviewCount?: number
  totalReviews?: number
  freeShipping?: boolean
  deliveryTime?: string
  sellerName?: string
  sellerRating?: number
}

function transformProduct(raw: RawProduct): Product {
  return {
    id: raw.productId || raw.itemCode || '',
    title: raw.title || raw.itemTitle || 'Untitled Product',
    price: raw.salePrice || raw.price || 0,
    currency: raw.currency || 'USD',
    rating: raw.rating || 0,
    reviewCount: raw.reviewCount || raw.totalReviews || 0,
    imageUrl: raw.imageUrl || raw.itemImage || '',
    productUrl: raw.productUrl || raw.itemUrl || '',
    shipping: {
      free: raw.freeShipping || false,
      estimatedDays: raw.deliveryTime
    },
    seller: {
      name: raw.sellerName || 'Unknown Seller',
      rating: raw.sellerRating || 0
    }
  }
}

export const apiClient = new DHgateAPIClient()
