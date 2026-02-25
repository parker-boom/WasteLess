import type { ReactNode } from 'react'
import type { MainTab } from '../app/types'

type AppScaffoldProps = {
  activeTab: MainTab
  showBottomNav: boolean
  onNavigate: (tab: MainTab) => void
  children: ReactNode
}

export function AppScaffold({
  activeTab,
  showBottomNav,
  onNavigate,
  children,
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
          <p className="app-title">WasteLess</p>
        </header>

        <main className="app-content">{children}</main>

        {showBottomNav ? (
          <BottomNav activeTab={activeTab} onNavigate={onNavigate} />
        ) : null}
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
        icon={<ClockIcon />}
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

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5zm.75 4a.75.75 0 0 0-1.5 0v6c0 .2.08.39.22.53l3.5 3.5a.75.75 0 1 0 1.06-1.06l-3.28-3.29V6.25z"
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
