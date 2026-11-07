const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')

export class TrafficAnalysisApiError extends Error {
  constructor(message, { backendOffline = false } = {}) {
    super(message)
    this.backendOffline = backendOffline
  }
}

export async function checkApiHealth(signal) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, { signal })
    if (!response.ok) return false
    const payload = await response.json()
    return payload?.status === 'ok' && payload?.service === 'netrax-api'
  } catch (error) {
    if (error.name === 'AbortError') throw error
    return false
  }
}

export async function analyzeTraffic(file, signal) {
  const formData = new FormData()
  formData.append('file', file)
  let response

  try {
    response = await fetch(`${API_BASE_URL}/api/analyze`, { method: 'POST', body: formData, signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new TrafficAnalysisApiError('Traffic analysis service is not connected.', { backendOffline: true })
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    let message = body
    try {
      const payload = JSON.parse(body)
      message = payload?.message || payload?.detail || body
    } catch {
      // Keep the plain-text response when the service does not return JSON.
    }
    throw new TrafficAnalysisApiError(message || `Traffic analysis failed (${response.status}).`)
  }

  return response.json()
}
