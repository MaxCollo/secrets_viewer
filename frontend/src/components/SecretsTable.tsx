import { useMemo, useState } from 'react'
import type { SecretEntry } from '../types/api'

const SOURCE_STYLES: Record<string, string> = {
  secret: 'bg-violet-950/60 text-violet-300 border-violet-800',
  configmap: 'bg-sky-950/60 text-sky-300 border-sky-800',
  env: 'bg-zinc-800/60 text-zinc-400 border-zinc-700',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
      title="Copy value"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
          />
        </svg>
      )}
    </button>
  )
}

function MaskedValue({ value, isSecret }: { value: string; isSecret: boolean }) {
  const [revealed, setRevealed] = useState(false)

  if (!isSecret || !value) {
    return <span className="text-zinc-300">{value || <span className="text-zinc-600 italic">empty</span>}</span>
  }

  return (
    <button
      onClick={() => setRevealed(v => !v)}
      className="text-left hover:text-zinc-200 transition-colors"
      title={revealed ? 'Click to hide' : 'Click to reveal'}
    >
      {revealed ? (
        <span className="text-zinc-300">{value}</span>
      ) : (
        <span className="text-zinc-500 select-none tracking-wider">{'*'.repeat(Math.min(value.length, 16))}</span>
      )}
    </button>
  )
}

interface SecretsTableProps {
  secrets: SecretEntry[]
  loading: boolean
}

export function SecretsTable({ secrets, loading }: SecretsTableProps) {
  const [filter, setFilter] = useState('')
  const [sortAsc, setSortAsc] = useState(true)

  const filtered = useMemo(() => {
    const q = filter.toLowerCase()
    const list = secrets.filter(
      s => s.name.toLowerCase().includes(q) || s.source.toLowerCase().includes(q)
    )
    list.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name)
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [secrets, filter, sortAsc])

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="px-4 py-3 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Environment Variables
          <span className="ml-2 text-zinc-600 font-mono normal-case">
            {filtered.length}{filter && ` / ${secrets.length}`}
          </span>
        </h2>
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Filter by name or source..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full sm:w-64 bg-zinc-800 border border-zinc-700 rounded-md pl-8 pr-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-800">
              <th className="px-4 py-2.5 font-medium w-[40%]">
                <button
                  onClick={() => setSortAsc(v => !v)}
                  className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                >
                  Name
                  <svg
                    className={`w-3 h-3 transition-transform ${sortAsc ? '' : 'rotate-180'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
              </th>
              <th className="px-4 py-2.5 font-medium">Value</th>
              <th className="px-4 py-2.5 font-medium w-28">Source</th>
              <th className="px-4 py-2.5 font-medium w-10" />
            </tr>
          </thead>
          <tbody>
            {loading && secrets.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-600">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-600">
                  {filter ? 'No matching variables' : 'No variables found'}
                </td>
              </tr>
            ) : (
              filtered.map(s => (
                <tr
                  key={s.name}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-4 py-2 font-mono text-zinc-200 truncate max-w-0">
                    {s.name}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm max-w-xs truncate">
                    <MaskedValue value={s.value} isSecret={s.source === 'secret'} />
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded border ${
                        SOURCE_STYLES[s.source] ?? SOURCE_STYLES.env
                      }`}
                    >
                      {s.source}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <CopyButton text={s.value} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
