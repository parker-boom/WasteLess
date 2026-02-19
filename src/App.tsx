import { useEffect, useState } from 'react'

type TabId = 'home' | 'recipe' | 'alerts'

type TabConfig = {
  id: TabId
  label: string
}

const tabStorageKey = 'wasteless.activeTab'

const tabs: TabConfig[] = [
  { id: 'home', label: 'Home' },
  { id: 'recipe', label: 'Recipe' },
  { id: 'alerts', label: 'Alerts' },
]

const tabCopy: Record<TabId, { subtitle: string }> = {
  home: { subtitle: 'Daily dashboard' },
  recipe: { subtitle: 'Recipe ideas' },
  alerts: { subtitle: 'Smart reminders' },
}

function isTabId(value: string | null): value is TabId {
  return tabs.some((tab) => tab.id === value)
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M3.75 10.75L12 4l8.25 6.75v8.25a1 1 0 0 1-1 1h-5.5v-6h-3.5v6h-5.5a1 1 0 0 1-1-1v-8.25z"
        fill="currentColor"
      />
    </svg>
  )
}

function RecipeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M5 5.5a2.5 2.5 0 0 1 2.5-2.5H18a1 1 0 0 1 1 1v16a1 1 0 0 1-1.6.8l-3.4-2.55L10.6 20.8A1 1 0 0 1 9 20V5.5z"
        fill="currentColor"
      />
      <rect x="7.5" y="7.5" width="8.5" height="1.5" rx=".75" fill="white" />
      <rect x="7.5" y="11" width="6.5" height="1.5" rx=".75" fill="white" />
    </svg>
  )
}

function AlertsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 3.5a5.5 5.5 0 0 0-5.5 5.5v2.4c0 .8-.2 1.58-.57 2.3L4.5 16.5h15l-1.43-2.8a5.2 5.2 0 0 1-.57-2.3V9A5.5 5.5 0 0 0 12 3.5z"
        fill="currentColor"
      />
      <path
        d="M9.5 18.5a2.5 2.5 0 0 0 5 0h-5z"
        fill="currentColor"
      />
    </svg>
  )
}

const iconMap: Record<TabId, () => ReturnType<typeof HomeIcon>> = {
  home: HomeIcon,
  recipe: RecipeIcon,
  alerts: AlertsIcon,
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (typeof window === 'undefined') {
      return 'home'
    }

    const savedTab = window.localStorage.getItem(tabStorageKey)
    return isTabId(savedTab) ? savedTab : 'home'
  })

  useEffect(() => {
    window.localStorage.setItem(tabStorageKey, activeTab)
  }, [activeTab])

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#e3f7ea_0%,#f7fbff_55%,#d7f0fb_100%)] px-4 py-[10vh]">
      <div className="mx-auto flex h-[80vh] w-[390px] max-w-full flex-col overflow-hidden rounded-[2.5rem] border-[10px] border-slate-900 bg-white shadow-[0_25px_65px_rgba(15,23,42,0.35)]">
        <header className="flex items-center justify-center border-b border-slate-200 px-5 py-4">
          <div className="h-1.5 w-16 rounded-full bg-slate-300" />
        </header>

        <main className="flex flex-1 items-center justify-center px-8 py-10">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {tabCopy[activeTab].subtitle}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              WasteLess
            </h1>
          </div>
        </main>

        <nav className="grid grid-cols-3 border-t border-slate-200 bg-white/90">
          {tabs.map((tab) => {
            const Icon = iconMap[tab.id]
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition ${
                  isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default App
