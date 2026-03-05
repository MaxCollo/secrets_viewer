import { useState } from 'react'
import { useApiData } from './hooks/useApi'
import { Header } from './components/Header'
import { HealthBanner } from './components/HealthBanner'
import { PodInfoCard } from './components/PodInfoCard'
import { SecretsTable } from './components/SecretsTable'

function App() {
  const [autoRefresh, setAutoRefresh] = useState(false)
  const { secrets, podInfo, health, error, loading, refresh } = useApiData(autoRefresh)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header
        version={health?.version ?? null}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh(v => !v)}
        onRefresh={refresh}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-fade-in">
        <HealthBanner health={health} loading={loading} />

        {error && (
          <div className="bg-red-950/60 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {podInfo && <PodInfoCard info={podInfo} />}
        <SecretsTable secrets={secrets} loading={loading} />
      </main>
    </div>
  )
}

export default App
