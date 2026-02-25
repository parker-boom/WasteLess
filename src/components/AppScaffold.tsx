import type { ReactNode } from 'react'
import type { MainTab } from '../app/types'

type AppScaffoldProps = {
  activeTab: MainTab
  showBottomNav: boolean
  onNavigate: (tab: MainTab) => void
  children: ReactNode
  overlay?: ReactNode
}

export function AppScaffold({
  activeTab,
  showBottomNav,
  onNavigate,
  children,
  overlay,
}: AppScaffoldProps) {
  return (
    <div className="app-backdrop">
      <div className="phone-shell">
        <header className="app-header">
          <button
            type="button"
            className="menu-button"
            aria-label="Menu (visual only)"
            aria-disabled="true"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="app-brand">
            <img src="/LogoFinalWL.png" alt="WasteLess logo" className="app-logo" />
            <p className="app-title">WasteLess</p>
          </div>
        </header>

        <main className="app-content">{children}</main>

        {showBottomNav ? (
          <BottomNav activeTab={activeTab} onNavigate={onNavigate} />
        ) : null}

        {overlay ?? null}
      </div>
    </div>
  )
}

type BottomNavProps = {
  activeTab: MainTab
  onNavigate: (tab: MainTab) => void
}

function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <NavButton
        label="Recipes"
        isActive={activeTab === 'recipes'}
        onClick={() => onNavigate('recipes')}
        icon={<RecipeIcon />}
      />
      <NavButton
        label="Home"
        isActive={activeTab === 'home'}
        onClick={() => onNavigate('home')}
        icon={<HomeIcon />}
      />
      <NavButton
        label="Reminders"
        isActive={activeTab === 'reminders'}
        onClick={() => onNavigate('reminders')}
        icon={<ReminderIcon />}
      />
    </nav>
  )
}

type NavButtonProps = {
  label: string
  isActive: boolean
  onClick: () => void
  icon: ReactNode
}

function NavButton({ label, isActive, onClick, icon }: NavButtonProps) {
  return (
    <button
      type="button"
      className={`bottom-nav-button ${isActive ? 'is-active' : ''}`}
      onClick={onClick}
    >
      <span className="bottom-nav-icon">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function RecipeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 4.75a1.75 1.75 0 0 1 1.75-1.75h11.5A1.75 1.75 0 0 1 19 4.75v14.5A1.75 1.75 0 0 1 17.25 21H5.75A1.75 1.75 0 0 1 4 19.25V4.75zm3 1.5v1.5h9.5v-1.5H7zm0 4v1.5h9.5v-1.5H7zm0 4v1.5h6v-1.5H7z"
      />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3.25a1 1 0 0 1 .65.24l7 5.98a1 1 0 0 1-.65 1.76h-.75v7a1.75 1.75 0 0 1-1.75 1.75h-3.5a1 1 0 0 1-1-1v-4h-2v4a1 1 0 0 1-1 1H5.5a1.75 1.75 0 0 1-1.75-1.75v-7H3a1 1 0 0 1-.65-1.76l7-5.98a1 1 0 0 1 .65-.24z"
      />
    </svg>
  )
}

function ReminderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.5 8.5A4.5 4.5 0 0 1 9 4h6a4.5 4.5 0 0 1 4.5 4.5v2.74c0 .73.18 1.45.53 2.09l1.07 1.96a.75.75 0 0 1-.66 1.11H3.56a.75.75 0 0 1-.66-1.1l1.07-1.97c.35-.64.53-1.36.53-2.09V8.5zm7.5 13.25c-1.25 0-2.3-.84-2.62-2h5.24a2.75 2.75 0 0 1-2.62 2z"
      />
    </svg>
  )
}
