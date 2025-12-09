export type ResponseFormat = 'concise' | 'detailed'

export type SortOption = 'sales' | 'price_up' | 'price_down' | 'default' | 'newest' | 'rating'

export interface Product {
  id: string
  title: string
  price: number
  currency: string
  rating: number
  reviewCount: number
  imageUrl: string
  productUrl: string
  shipping: {
    free: boolean
    estimatedDays?: string
  }
  seller: {
    name: string
    rating: number
  }
}

export interface SearchResult {
  totalResults: number
  page: number
  products: Product[]
  hasMore: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface RateLimitState {
  requests: number
  resetTime: number
}
