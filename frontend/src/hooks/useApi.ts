import { useCallback, useEffect, useRef, useState } from 'react'
import type { HealthStatus, PodInfo, SecretEntry } from '../types/api'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`)
  return res.json()
}

export function useApiData(autoRefresh: boolean, intervalMs = 5000) {
  const [secrets, setSecrets] = useState<SecretEntry[]>([])
  const [podInfo, setPodInfo] = useState<PodInfo | null>(null)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    try {
      const [s, i, h] = await Promise.all([
        fetchJson<SecretEntry[]>('/api/secrets'),
        fetchJson<PodInfo>('/api/info'),
        fetchJson<HealthStatus>('/health'),
      ])
      setSecrets(s)
      setPodInfo(i)
      setHealth(h)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(load, intervalMs)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [autoRefresh, intervalMs, load])

  return { secrets, podInfo, health, error, loading, refresh: load }
}
