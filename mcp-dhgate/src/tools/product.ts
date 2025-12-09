import { z } from 'zod'
import { apiClient } from '../api/client.js'
import { formatProduct } from '../utils/formatters.js'
import { DHgateAPIError } from '../utils/errors.js'
import type { ResponseFormat } from '../types.js'

export const GetProductDetailsSchema = z.object({
  product_id: z.string()
    .min(1, 'Product ID cannot be empty')
    .describe('DHgate product ID or product code. Example: "12345678" or "ff8080817c9a8b89017ca0e5c8c71234"'),
  response_format: z.enum(['concise', 'detailed'])
    .optional()
    .describe('Output format: "concise" for human-readable summary (default), "detailed" for full JSON data')
}).strict()

export type GetProductDetailsInput = z.infer<typeof GetProductDetailsSchema>

export async function getProductDetails(input: GetProductDetailsInput): Promise<string> {
  try {
    const product = await apiClient.getProductDetails(input.product_id)

    return formatProduct(product, input.response_format as ResponseFormat)
  } catch (error) {
    if (error instanceof DHgateAPIError) {
      return error.toUserMessage()
    }
    throw error
  }
}

export const getProductDetailsMetadata = {
  name: 'get_product_details',
  description: `Get comprehensive details for a specific DHgate product by its ID.

This tool retrieves in-depth information about a single product including full specifications, seller details, shipping options, and review data.

Use this tool when:
- User wants detailed information about a specific product
- Need to verify product specs before writing a review
- Comparing specific products (call this tool multiple times)
- Getting seller information and ratings

The product_id can be found in search results or extracted from DHgate product URLs.`,
  inputSchema: {
    type: 'object',
    properties: {
      product_id: {
        type: 'string',
        description: 'DHgate product ID or product code. Example: "12345678" or "ff8080817c9a8b89017ca0e5c8c71234"'
      },
      response_format: {
        type: 'string',
        enum: ['concise', 'detailed'],
        description: 'Output format: "concise" for human-readable summary (default), "detailed" for full JSON data'
      }
    },
    required: ['product_id']
  }
} as const
