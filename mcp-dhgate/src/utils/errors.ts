export class DHgateAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestedAction: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'DHgateAPIError'
  }

  toUserMessage(): string {
    return `${this.message}\n\n${this.suggestedAction}`
  }
}

export function mapApiError(statusCode: number, message: string): DHgateAPIError {
  switch (statusCode) {
    case 401:
    case 403:
      return new DHgateAPIError(
        'API authentication failed',
        'AUTH_FAILED',
        'Please verify your DHGATE_API_TOKEN environment variable is set correctly. Get your token from https://tmapi.top/console',
        statusCode
      )

    case 429:
      return new DHgateAPIError(
        'Rate limit exceeded',
        'RATE_LIMIT',
        'The API allows 60 requests per minute. Please wait a moment and try again.',
        statusCode
      )

    case 422:
      return new DHgateAPIError(
        `Invalid parameters: ${message}`,
        'INVALID_PARAMS',
        'Check your input parameters. Example: search_products with keywords="laptop" and sort="price_up"',
        statusCode
      )

    case 417:
      return new DHgateAPIError(
        'Request validation failed',
        'VALIDATION_ERROR',
        'One or more required parameters are missing or invalid. Please check the parameter requirements.',
        statusCode
      )

    case 439:
      return new DHgateAPIError(
        'API quota exceeded',
        'QUOTA_EXCEEDED',
        'Your API quota has been exceeded. Please upgrade your plan at https://tmapi.top/console or wait until your quota resets.',
        statusCode
      )

    case 499:
      return new DHgateAPIError(
        'Request timeout',
        'TIMEOUT',
        'The API request took too long to complete. Try simplifying your search or try again later.',
        statusCode
      )

    case 500:
    case 503:
      return new DHgateAPIError(
        'DHgate API service error',
        'SERVICE_ERROR',
        'The DHgate API is experiencing issues. Please try again in a few minutes.',
        statusCode
      )

    default:
      return new DHgateAPIError(
        `API error: ${message}`,
        'UNKNOWN_ERROR',
        'An unexpected error occurred. Please try again or contact support if the issue persists.',
        statusCode
      )
  }
}

export function handleNetworkError(error: Error): DHgateAPIError {
  if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
    return new DHgateAPIError(
      'Unable to connect to DHgate API',
      'NETWORK_ERROR',
      'Please verify your internet connection and try again. If the issue persists, the API service may be temporarily unavailable.'
    )
  }

  if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
    return new DHgateAPIError(
      'Request timeout',
      'TIMEOUT',
      'The API request took too long to complete. Try again or simplify your search parameters.'
    )
  }

  return new DHgateAPIError(
    `Network error: ${error.message}`,
    'NETWORK_ERROR',
    'A network error occurred. Please check your connection and try again.'
  )
}
