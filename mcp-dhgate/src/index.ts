#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { CONFIG, validateConfig } from './config.js'
import {
  searchProducts,
  searchProductsMetadata,
  SearchProductsSchema
} from './tools/search.js'
import {
  getProductDetails,
  getProductDetailsMetadata,
  GetProductDetailsSchema
} from './tools/product.js'
import {
  generateAffiliateLink,
  generateAffiliateLinkMetadata,
  GenerateAffiliateLinkSchema
} from './tools/affiliate.js'

class DHgateMCPServer {
  private server: Server

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-dhgate',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    )

    this.setupToolHandlers()
    this.setupErrorHandling()
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        searchProductsMetadata,
        getProductDetailsMetadata,
        generateAffiliateLinkMetadata
      ]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'search_products': {
            const validated = SearchProductsSchema.parse(args)
            const result = await searchProducts(validated)
            return {
              content: [
                {
                  type: 'text',
                  text: result
                }
              ]
            }
          }

          case 'get_product_details': {
            const validated = GetProductDetailsSchema.parse(args)
            const result = await getProductDetails(validated)
            return {
              content: [
                {
                  type: 'text',
                  text: result
                }
              ]
            }
          }

          case 'generate_affiliate_link': {
            const validated = GenerateAffiliateLinkSchema.parse(args)
            const result = await generateAffiliateLink(validated)
            return {
              content: [
                {
                  type: 'text',
                  text: result
                }
              ]
            }
          }

          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error) {
        if (error instanceof Error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error.message}`
              }
            ],
            isError: true
          }
        }
        throw error
      }
    })
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error)
    }

    process.on('SIGINT', async () => {
      await this.server.close()
      process.exit(0)
    })
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)

    console.error('DHgate MCP Server running on stdio')
    console.error(`Configuration:`)
    console.error(`  - API Base URL: ${CONFIG.apiBaseUrl}`)
    console.error(`  - Rate Limit: ${CONFIG.rateLimit} requests/min`)
    console.error(`  - Default Format: ${CONFIG.defaultResponseFormat}`)
    console.error(`  - Affiliate ID: ${CONFIG.affiliateId ? 'Configured ✓' : 'Not configured ⚠️'}`)
  }
}

async function main() {
  try {
    validateConfig()
    const server = new DHgateMCPServer()
    await server.run()
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

main()
