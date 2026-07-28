/** Общие фабрики ошибок для nuxt-тестов доменных composables. */

export function validationError(errors: Record<string, string[]>) {
  return {
    response: { status: 422 },
    statusCode: 422,
    data: { errors },
  }
}

export function networkError() {
  return new Error('network')
}
