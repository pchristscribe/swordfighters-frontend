import { config } from 'dotenv'

config()

export const CONFIG = {
  apiToken: process.env.DHGATE_API_TOKEN || '',
  apiBaseUrl: process.env.DHGATE_API_BASE_URL || 'https://tmapi.top/api/dhgate',
  apiTimeout: parseInt(process.env.DHGATE_API_TIMEOUT || '30000', 10),
  rateLimit: parseInt(process.env.DHGATE_RATE_LIMIT || '60', 10),
  defaultResponseFormat: (process.env.DEFAULT_RESPONSE_FORMAT || 'concise') as 'concise' | 'detailed',
  maxProductsPerPage: parseInt(process.env.MAX_PRODUCTS_PER_PAGE || '50', 10),
  characterLimit: parseInt(process.env.CHARACTER_LIMIT || '25000', 10),
  affiliateId: process.env.DHGATE_AFFILIATE_ID || ''
} as const

export function validateConfig(): void {
  if (!CONFIG.apiToken) {
    throw new Error(
      'DHGATE_API_TOKEN is required. Please set it in your .env file or environment variables. ' +
      'Get your token from https://tmapi.top/console'
    )
  }
}
