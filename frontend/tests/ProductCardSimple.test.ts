import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from '../app/components/ProductCardSimple.vue'
import type { Product } from '../app/types'

// Mock product data - extending Product type with originalPrice
const mockProduct: Product & { originalPrice?: number } = {
  id: 'product-1',
  externalId: 'ext-123',
  platform: 'DHGATE',
  title: 'Rainbow Pride Flag',
  description: 'Large rainbow pride flag for celebrations',
  imageUrl: 'https://example.com/flag.jpg',
  price: 12.99,
  currency: 'USD',
  priceUpdatedAt: '2024-01-01T00:00:00Z',
  categoryId: 'cat-1',
  status: 'ACTIVE',
  rating: 4.5,
  reviewCount: 120,
  tags: ['pride', 'flag'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockProductWithDiscount: Product & { originalPrice: number } = {
  ...mockProduct,
  id: 'product-2',
  price: 9.99,
  originalPrice: 19.99,
}

describe('ProductCardSimple Component', () => {
  describe('Rendering', () => {
    it('renders product image with correct src attribute', () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
      })

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe(mockProduct.imageUrl)
    })

    it('renders product image with correct alt attribute', () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
      })

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe(mockProduct.title)
    })

    it('renders product title in h3 element', () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
      })

      const title = wrapper.find('h3')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe(mockProduct.title)
    })

    it('renders product price with dollar sign', () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
      })

      const price = wrapper.find('.price')
      expect(price.exists()).toBe(true)
      expect(price.text()).toBe('$12.99')
    })

    it('renders Add to Cart button', () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
      })

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Add to Cart')
    })

    it('does not render discount badge when showDiscount is false', () => {
      const wrapper = mount(ProductCard, {
        props: {
          product: mockProductWithDiscount,
          showDiscount: false,
        },
      })

      const discount = wrapper.find('.discount')
      expect(discount.exists()).toBe(false)
    })

    it('does not render discount badge when showDiscount is true but no originalPrice', () => {
      const wrapper = mount(ProductCard, {
        props: {
          product: mockProduct,
          showDiscount: true,
        },
      })

      const discount = wrapper.find('.discount')
      expect(discount.exists()).toBe(false)
    })

    it('renders discount badge when showDiscount is true and originalPrice exists', () => {
      const wrapper = mount(ProductCard, {
        props: {
          product: mockProductWithDiscount,
          showDiscount: true,
        },
      })

      const discount = wrapper.find('.discount')
      expect(discount.exists()).toBe(true)
      expect(discount.text()).toBe('50% OFF')
    })
  })

  describe('Discount Calculation', () => {
    it('calculates 50% discount correctly', () => {
      const wrapper = mount(ProductCard, {
        props: {
          product: mockProductWithDiscount,
          showDiscount: true,
        },
      })

      const discount = wrapper.find('.discount')
      expect(discount.text()).toBe('50% OFF')
    })

    it('calculates 25% discount correctly', () => {
      const product = {
        ...mockProduct,
        price: 15.0,
        originalPrice: 20.0,
      }

      const wrapper = mount(ProductCard, {
        props: {
          product,
          showDiscount: true,
        },
      })

      const discount = wrapper.find('.discount')
      expect(discount.text()).toBe('25% OFF')
    })

    it('calculates 10% discount correctly', () => {
      const product = {
        ...mockProduct,
        price: 18.0,
        originalPrice: 20.0,
      }

      const wrapper = mount(ProductCard, {
        props: {
          product,
          showDiscount: true,
        },
      })

      const discount = wrapper.find('.discount')
      expect(discount.text()).toBe('10% OFF')
    })

    it('rounds discount percentage to nearest integer', () => {
      const product = {
        ...mockProduct,
        price: 16.67,
        originalPrice: 20.0,
      }

      const wrapper = mount(ProductCard, {
        props: {
          product,
          showDiscount: true,
        },
      })

      const discount = wrapper.find('.discount')
      // (20 - 16.67) / 20 = 0.1665 = 16.65% -> rounds to 17%
      expect(discount.text()).toBe('17% OFF')
    })

    it('does not show discount badge when discountPercentage is 0', () => {
      const product = {
        ...mockProduct,
        price: 20.0,
        originalPrice: 20.0,
      }

      const wrapper = mount(ProductCard, {
        props: {
          product,
          showDiscount: true,
        },
      })

      const discount = wrapper.find('.discount')
      expect(discount.exists()).toBe(false)
    })

    it('handles negative discount when price is higher than originalPrice', () => {
      const product = {
        ...mockProduct,
        price: 25.0,
        originalPrice: 20.0,
      }

      const wrapper = mount(ProductCard, {
        props: {
          product,
          showDiscount: true,
        },
      })

      const discount = wrapper.find('.discount')
      // Component shows negative discount (potential bug to document)
      expect(discount.text()).toBe('-25% OFF')
    })

    it('does not show discount for very small percentages (<1%) that round to 0', () => {
      const product = {
        ...mockProduct,
        price: 19.99,
        originalPrice: 20.0,
      }

      const wrapper = mount(ProductCard, {
        props: {
          product,
          showDiscount: true,
        },
      })

      const discount = wrapper.find('.discount')
      // 0.01 / 20 = 0.0005 = 0.05% -> rounds to 0%
      expect(discount.exists()).toBe(false)
    })
  })

  describe('Event Emissions', () => {
    it('emits add-to-cart event when Add to Cart button is clicked', async () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
      })

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(wrapper.emitted('add-to-cart')).toBeTruthy()
      expect(wrapper.emitted('add-to-cart')?.[0]).toEqual([mockProduct])
    })

    it('emits correct product in add-to-cart event payload', async () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProductWithDiscount },
      })

      const button = wrapper.find('button')
      await button.trigger('click')

      const emittedEvents = wrapper.emitted('add-to-cart')
      expect(emittedEvents).toBeTruthy()
      expect(emittedEvents?.[0][0]).toEqual(mockProductWithDiscount)
    })

    it('emits multiple add-to-cart events when button clicked multiple times', async () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
      })

      const button = wrapper.find('button')
      await button.trigger('click')
      await button.trigger('click')
      await button.trigger('click')

      expect(wrapper.emitted('add-to-cart')).toHaveLength(3)
      expect(wrapper.emitted('add-to-cart')?.[0]).toEqual([mockProduct])
      expect(wrapper.emitted('add-to-cart')?.[1]).toEqual([mockProduct])
      expect(wrapper.emitted('add-to-cart')?.[2]).toEqual([mockProduct])
    })
  })

  describe('Props Validation', () => {
    it('uses default value false for showDiscount prop when not provided', () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProductWithDiscount },
      })

      // Default is false, so discount should not show
      const discount = wrapper.find('.discount')
      expect(discount.exists()).toBe(false)
    })

    it('accepts showDiscount as explicit true', () => {
      const wrapper = mount(ProductCard, {
        props: {
          product: mockProductWithDiscount,
          showDiscount: true,
        },
      })

      const discount = wrapper.find('.discount')
      expect(discount.exists()).toBe(true)
    })

    it('accepts showDiscount as explicit false', () => {
      const wrapper = mount(ProductCard, {
        props: {
          product: mockProductWithDiscount,
          showDiscount: false,
        },
      })

      const discount = wrapper.find('.discount')
      expect(discount.exists()).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('handles product with empty title', () => {
      const product = { ...mockProduct, title: '' }
      const wrapper = mount(ProductCard, {
        props: { product },
      })

      const title = wrapper.find('h3')
      expect(title.text()).toBe('')
    })

    it('handles product with very long title (200+ characters)', () => {
      const longTitle = 'A'.repeat(200)
      const product = { ...mockProduct, title: longTitle }
      const wrapper = mount(ProductCard, {
        props: { product },
      })

      const title = wrapper.find('h3')
      expect(title.text()).toBe(longTitle)
    })

    it('handles product with empty imageUrl', () => {
      const product = { ...mockProduct, imageUrl: '' }
      const wrapper = mount(ProductCard, {
        props: { product },
      })

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('')
    })

    it('handles product with price of 0', () => {
      const product = { ...mockProduct, price: 0 }
      const wrapper = mount(ProductCard, {
        props: { product },
      })

      const price = wrapper.find('.price')
      expect(price.text()).toBe('$0')
    })

    it('handles product with very high price', () => {
      const product = { ...mockProduct, price: 9999.99 }
      const wrapper = mount(ProductCard, {
        props: { product },
      })

      const price = wrapper.find('.price')
      expect(price.text()).toBe('$9999.99')
    })

    it('handles product with price having many decimal places', () => {
      const product = { ...mockProduct, price: 12.999999 }
      const wrapper = mount(ProductCard, {
        props: { product },
      })

      const price = wrapper.find('.price')
      // Component displays full decimal precision (no formatting applied)
      expect(price.text()).toBe('$12.999999')
    })

    it('handles product with special characters in title', () => {
      const product = { ...mockProduct, title: 'Test & "Product" <Special> Chars' }
      const wrapper = mount(ProductCard, {
        props: { product },
      })

      const title = wrapper.find('h3')
      expect(title.text()).toBe('Test & "Product" <Special> Chars')
    })
  })

  describe('Reactivity', () => {
    it('updates display when product prop changes', async () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
      })

      expect(wrapper.find('h3').text()).toBe(mockProduct.title)
      expect(wrapper.find('.price').text()).toBe('$12.99')

      const newProduct = {
        ...mockProduct,
        title: 'New Product Title',
        price: 25.99,
      }

      await wrapper.setProps({ product: newProduct })

      expect(wrapper.find('h3').text()).toBe('New Product Title')
      expect(wrapper.find('.price').text()).toBe('$25.99')
    })

    it('updates discount display when showDiscount prop changes', async () => {
      const wrapper = mount(ProductCard, {
        props: {
          product: mockProductWithDiscount,
          showDiscount: false,
        },
      })

      expect(wrapper.find('.discount').exists()).toBe(false)

      await wrapper.setProps({ showDiscount: true })

      expect(wrapper.find('.discount').exists()).toBe(true)
      expect(wrapper.find('.discount').text()).toBe('50% OFF')
    })

    it('recalculates discount percentage when product price changes', async () => {
      const wrapper = mount(ProductCard, {
        props: {
          product: mockProductWithDiscount,
          showDiscount: true,
        },
      })

      expect(wrapper.find('.discount').text()).toBe('50% OFF')

      const updatedProduct = {
        ...mockProductWithDiscount,
        price: 14.99,
      }

      await wrapper.setProps({ product: updatedProduct })

      // (19.99 - 14.99) / 19.99 = 0.25012... = 25%
      expect(wrapper.find('.discount').text()).toBe('25% OFF')
    })
  })

  describe('Accessibility', () => {
    it('provides accessible alt text for product image', () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
      })

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBeTruthy()
      expect(img.attributes('alt')).toBe(mockProduct.title)
    })

    it('provides descriptive alt text for screen readers when title is descriptive', () => {
      const product = {
        ...mockProduct,
        title: 'Rainbow Pride Flag 3x5 Feet with Brass Grommets',
      }

      const wrapper = mount(ProductCard, {
        props: { product },
      })

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('Rainbow Pride Flag 3x5 Feet with Brass Grommets')
    })
  })

  describe('Component Structure', () => {
    it('has product-card class on root element', () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
      })

      expect(wrapper.find('.product-card').exists()).toBe(true)
    })

    it('renders elements in correct order without discount', () => {
      const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
      })

      const productCard = wrapper.find('.product-card')
      const children = productCard.element.children

      // Expected order: img, h3, p.price, button
      expect(children[0].tagName).toBe('IMG')
      expect(children[1].tagName).toBe('H3')
      expect(children[2].classList.contains('price')).toBe(true)
      expect(children[3].tagName).toBe('BUTTON')
    })

    it('renders elements in correct order with discount', () => {
      const wrapper = mount(ProductCard, {
        props: {
          product: mockProductWithDiscount,
          showDiscount: true,
        },
      })

      const productCard = wrapper.find('.product-card')
      const children = productCard.element.children

      // Expected order: img, h3, div.discount, p.price, button
      expect(children[0].tagName).toBe('IMG')
      expect(children[1].tagName).toBe('H3')
      expect(children[2].classList.contains('discount')).toBe(true)
      expect(children[3].classList.contains('price')).toBe(true)
      expect(children[4].tagName).toBe('BUTTON')
    })
  })
})
