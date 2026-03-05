import type { PodInfo } from '../types/api'

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h ago`
}

export function PodInfoCard({ info }: { info: PodInfo }) {
  const fields = [
    { label: 'Hostname', value: info.hostname },
    { label: 'Pod Name', value: info.podName },
    { label: 'Namespace', value: info.namespace },
    { label: 'Node', value: info.nodeName },
    { label: 'Uptime', value: timeAgo(info.startTime) },
  ]

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
        Pod Info
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {fields.map(f => (
          <div key={f.label}>
            <div className="text-[11px] text-zinc-500 mb-0.5">{f.label}</div>
            <div className="text-sm font-mono text-zinc-200 truncate" title={f.value}>
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
