interface HeaderProps {
  version: string | null
  autoRefresh: boolean
  onToggleAutoRefresh: () => void
  onRefresh: () => void
}

export function Header({ version, autoRefresh, onToggleAutoRefresh, onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-violet-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
            Secrets Viewer
          </h1>
          {version && (
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
              v{version}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Refresh now"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
          </button>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs text-zinc-500">Auto</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={onToggleAutoRefresh}
                className="sr-only peer"
              />
              <div className="w-8 h-[18px] rounded-full bg-zinc-700 peer-checked:bg-violet-600 transition-colors" />
              <div className="absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-zinc-300 peer-checked:translate-x-[14px] transition-transform" />
            </div>
          </label>
        </div>
      </div>
    </header>
  )
}
