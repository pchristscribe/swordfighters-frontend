import type { Product, SearchResult, ResponseFormat } from '../types.js'
import { CONFIG } from '../config.js'

export function formatSearchResults(
  result: SearchResult,
  format: ResponseFormat = CONFIG.defaultResponseFormat
): string {
  if (format === 'concise') {
    return formatConcise(result)
  }
  return formatDetailed(result)
}

function formatConcise(result: SearchResult): string {
  const { totalResults, page, products, hasMore } = result

  let output = `Found ${totalResults} products (page ${page}):\n\n`

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const stars = '⭐'.repeat(Math.round(p.rating))
    const shipping = p.shipping.free ? '🚚 Free shipping' : '📦 Paid shipping'

    output += `${i + 1}. ${p.title}\n`
    output += `   💰 $${p.price.toFixed(2)} ${p.currency} | ${stars} ${p.rating} (${formatCount(p.reviewCount)} reviews)\n`
    output += `   ${shipping} | Seller: ${p.seller.name} (${p.seller.rating}% rating)\n`
    output += `   🔗 ${p.productUrl}\n\n`
  }

  if (hasMore) {
    output += `\n📄 More results available. Use page parameter to see additional products.`
  }

  return truncateResponse(output)
}

function formatDetailed(result: SearchResult): string {
  return truncateResponse(JSON.stringify(result, null, 2))
}

export function formatProduct(product: Product, format: ResponseFormat = CONFIG.defaultResponseFormat): string {
  if (format === 'concise') {
    const stars = '⭐'.repeat(Math.round(product.rating))
    const shipping = product.shipping.free ? '🚚 Free shipping' : `📦 Shipping: ${product.shipping.estimatedDays || 'Check listing'}`

    return `
📦 ${product.title}

💰 Price: $${product.price.toFixed(2)} ${product.currency}
${stars} ${product.rating}/5.0 (${formatCount(product.reviewCount)} reviews)

${shipping}
${product.shipping.estimatedDays ? `⏱️ Delivery: ${product.shipping.estimatedDays} days` : ''}

👤 Seller: ${product.seller.name}
⭐ Seller Rating: ${product.seller.rating}%

🔗 Product URL: ${product.productUrl}
🖼️ Image: ${product.imageUrl}
    `.trim()
  }

  return truncateResponse(JSON.stringify(product, null, 2))
}

export function formatProductComparison(products: Product[]): string {
  let output = `Comparing ${products.length} products:\n\n`

  output += '| Product | Price | Rating | Reviews | Shipping |\n'
  output += '|---------|-------|--------|---------|----------|\n'

  for (const p of products) {
    const title = p.title.length > 30 ? p.title.substring(0, 27) + '...' : p.title
    const shipping = p.shipping.free ? '✅ Free' : '❌ Paid'
    output += `| ${title} | $${p.price.toFixed(2)} | ${p.rating}/5 | ${formatCount(p.reviewCount)} | ${shipping} |\n`
  }

  return truncateResponse(output)
}

export function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export function truncateResponse(response: string): string {
  if (response.length <= CONFIG.characterLimit) {
    return response
  }

  const truncated = response.substring(0, CONFIG.characterLimit - 100)
  return `${truncated}\n\n⚠️ Response truncated due to length. Results exceed ${CONFIG.characterLimit} characters. Use pagination or filtering to see more specific results.`
}

export function toMarkdown(content: string): string {
  return content
}

export function toJSON(data: unknown): string {
  return JSON.stringify(data, null, 2)
}
