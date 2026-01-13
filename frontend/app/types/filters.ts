import type { Platform } from './index'

export interface FilterState {
  categoryId: string
  platform: Platform | ''
  minPrice: number
  maxPrice: number
  minRating: number
  sortBy: 'createdAt' | 'price' | 'rating' | 'title'
  order: 'asc' | 'desc'
}

export interface PriceRange {
  min: number
  max: number
}

export const DEFAULT_FILTER_STATE: FilterState = {
  categoryId: '',
  platform: '',
  minPrice: 0,
  maxPrice: 500,
  minRating: 0,
  sortBy: 'createdAt',
  order: 'desc',
}

export const PRICE_RANGE = {
  min: 0,
  max: 500,
  step: 10,
}

export const RATING_OPTIONS = [
  { value: 0, label: 'All Ratings', stars: 0 },
  { value: 4, label: '4+ Stars', stars: 4 },
  { value: 4.5, label: '4.5+ Stars', stars: 4.5 },
]
