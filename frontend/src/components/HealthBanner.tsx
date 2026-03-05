import type { HealthStatus } from '../types/api'

interface HealthBannerProps {
  health: HealthStatus | null
  loading: boolean
}

export function HealthBanner({ health, loading }: HealthBannerProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-600 animate-pulse" />
        <span className="text-sm text-zinc-500">Checking health...</span>
      </div>
    )
  }

  if (!health) {
    return (
      <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="text-sm text-red-300">Unreachable</span>
      </div>
    )
  }

  const isHealthy = health.status === 'healthy'
  return (
    <div
      className={`rounded-lg border px-4 py-3 flex items-center gap-2 ${
        isHealthy
          ? 'border-emerald-900 bg-emerald-950/40'
          : 'border-yellow-900 bg-yellow-950/40'
      }`}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          isHealthy ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-yellow-400'
        }`}
      />
      <span className={`text-sm ${isHealthy ? 'text-emerald-300' : 'text-yellow-300'}`}>
        {isHealthy ? 'All systems operational' : `Status: ${health.status}`}
      </span>
    </div>
  )
}
