import { z } from 'zod'
import { apiClient } from '../api/client.js'
import { formatSearchResults } from '../utils/formatters.js'
import { DHgateAPIError } from '../utils/errors.js'
import type { ResponseFormat } from '../types.js'

export const SearchProductsSchema = z.object({
  keywords: z.string()
    .min(1, 'Keywords cannot be empty')
    .max(100, 'Keywords must be 100 characters or less')
    .describe('Search terms for finding products. Examples: "wireless headphones", "men leather jacket", "smart watch"'),
  page: z.number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Page number for pagination (default: 1). Each page returns up to 50 products.'),
  sort: z.enum(['sales', 'price_up', 'price_down', 'default', 'newest', 'rating'])
    .optional()
    .describe('Sort order: "sales" (best selling), "price_up" (low to high), "price_down" (high to low), "default", "newest", "rating" (highest rated)'),
  free_shipping: z.boolean()
    .optional()
    .describe('Filter to show only products with free shipping (true) or all products (false/undefined)'),
  high_rating: z.boolean()
    .optional()
    .describe('Filter to show only highly-rated products with 4+ stars (true) or all products (false/undefined)'),
  response_format: z.enum(['concise', 'detailed'])
    .optional()
    .describe('Output format: "concise" for human-readable summaries (default), "detailed" for full JSON data')
}).strict()

export type SearchProductsInput = z.infer<typeof SearchProductsSchema>

export async function searchProducts(input: SearchProductsInput): Promise<string> {
  try {
    const result = await apiClient.searchProducts({
      keywords: input.keywords,
      page: input.page,
      sort: input.sort,
      free_shipping: input.free_shipping,
      high_rating: input.high_rating,
      country: 'us',
      currency: 'USD',
      language: 'en'
    })

    if (result.products.length === 0) {
      return `No products found for "${input.keywords}". Try:\n- Using different keywords\n- Removing filters (free_shipping, high_rating)\n- Checking spelling\n\nExample: search_products with keywords="laptop" and sort="price_up"`
    }

    return formatSearchResults(result, input.response_format as ResponseFormat)
  } catch (error) {
    if (error instanceof DHgateAPIError) {
      return error.toUserMessage()
    }
    throw error
  }
}

export const searchProductsMetadata = {
  name: 'search_products',
  description: `Search DHgate products by keywords with optional filtering and sorting.

This is the primary tool for discovering products to promote on your affiliate platform. Returns product listings with prices, ratings, seller info, and URLs.

Use this tool when:
- User asks to find products by category, type, or keywords
- Looking for products to feature in reviews or recommendations
- Comparing options within a product category
- Finding trending or popular items

The tool supports pagination, sorting by various criteria (price, sales, rating), and filtering for free shipping or high-rated items.`,
  inputSchema: {
    type: 'object',
    properties: {
      keywords: {
        type: 'string',
        description: 'Search terms for finding products. Examples: "wireless headphones", "men leather jacket", "smart watch"'
      },
      page: {
        type: 'number',
        description: 'Page number for pagination (default: 1). Each page returns up to 50 products.'
      },
      sort: {
        type: 'string',
        enum: ['sales', 'price_up', 'price_down', 'default', 'newest', 'rating'],
        description: 'Sort order: "sales" (best selling), "price_up" (low to high), "price_down" (high to low), "default", "newest", "rating" (highest rated)'
      },
      free_shipping: {
        type: 'boolean',
        description: 'Filter to show only products with free shipping'
      },
      high_rating: {
        type: 'boolean',
        description: 'Filter to show only highly-rated products with 4+ stars'
      },
      response_format: {
        type: 'string',
        enum: ['concise', 'detailed'],
        description: 'Output format: "concise" for human-readable summaries (default), "detailed" for full JSON data'
      }
    },
    required: ['keywords']
  }
} as const
