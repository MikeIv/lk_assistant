/** Заголовки для API отчётов (Contract-id из runtimeConfig, до auth/store). */
export function getReportRequestHeaders(): Record<string, string> {
  const { contractId } = useRuntimeConfig().public
  const headers: Record<string, string> = {}

  if (contractId) {
    headers['Contract-id'] = contractId
  }

  return headers
}
