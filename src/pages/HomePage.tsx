import { useMemo, useState } from 'react'
import { expiryLabel } from '../app/date'
import type { InventoryItem, Reminder } from '../app/types'

type HomePageProps = {
  items: InventoryItem[]
  reminders: Reminder[]
  onRequestSetReminder: (inventoryItemId: number) => void
  onRequestRemoveItem: (inventoryItemId: number) => void
  onOpenAddItems: () => void
}

export function HomePage({
  items,
  reminders,
  onRequestSetReminder,
  onRequestRemoveItem,
  onOpenAddItems,
}: HomePageProps) {
  const [visibleCount, setVisibleCount] = useState(4)

  const orderedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime(),
      ),
    [items],
  )

  const visibleItems = orderedItems.slice(0, visibleCount)
  const hasMore = orderedItems.length > visibleCount

  return (
    <section className="screen screen-home">
      <header className="screen-header">
        <p className="screen-overline">Inventory</p>
        <h1 className="screen-title">Expiring soon</h1>
      </header>

      <div className="list-stack">
        {visibleItems.map((item) => {
          const reminder = reminders.find(
            (entry) => entry.inventoryItemId === item.id,
          )

          return (
            <article key={item.id} className="inventory-card">
              <button
                type="button"
                className="inventory-remove-fab"
                onClick={() => onRequestRemoveItem(item.id)}
                title="Remove item"
                aria-label={`Remove ${item.name}`}
              >
                <span>X</span>
              </button>

              <ExpiryBadge label={expiryLabel(item.expirationDate)} />

              <div className="inventory-body">
                <p className="inventory-name">{item.name}</p>
                <p className="inventory-meta">
                  x{item.quantity} | {item.category}
                </p>
              </div>

              <div className="inventory-reminder">
                <button
                  type="button"
                  className={`reminder-square ${reminder ? 'is-set' : ''}`}
                  onClick={() => onRequestSetReminder(item.id)}
                  title={reminder ? 'Edit reminder' : 'Set reminder'}
                  aria-label={`${
                    reminder ? 'Edit reminder for' : 'Set reminder for'
                  } ${item.name}`}
                >
                  <BellGlyph />
                </button>

                <span className="reminder-status">
                  {reminder ? formatReminderStatus(reminder) : 'not set'}
                </span>
              </div>
            </article>
          )
        })}
      </div>

      <div className="split-actions">
        <button
          type="button"
          className="ghost-button"
          onClick={() => setVisibleCount((count) => count + 4)}
          disabled={!hasMore}
        >
          load more
        </button>
        <button type="button" className="primary-button" onClick={onOpenAddItems}>
          + add items
        </button>
      </div>
    </section>
  )
}

type ExpiryParts = {
  count: string
  unit: string
}

function ExpiryBadge({ label }: { label: string }) {
  const { count, unit } = toExpiryParts(label)

  return (
    <div className="inventory-expiry-badge">
      <span className="inventory-expiry-count">{count}</span>
      <span className="inventory-expiry-unit">{unit}</span>
    </div>
  )
}

function toExpiryParts(label: string): ExpiryParts {
  if (label === 'Today') {
    return { count: '0', unit: 'DAYS' }
  }

  if (label === 'Tomorrow') {
    return { count: '1', unit: 'DAY' }
  }

  const parsed = label.match(/^(\d+)\s+(.+)$/)
  if (!parsed) {
    return { count: '-', unit: label.toUpperCase() }
  }

  return {
    count: parsed[1],
    unit: parsed[2].toUpperCase(),
  }
}

function formatReminderStatus(reminder: Reminder): string {
  return reminder.remindInDays === 0
    ? 'today'
    : reminder.remindInDays === 1
      ? '1 day'
      : `${reminder.remindInDays} days`
}

function BellGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="reminder-square-glyph">
      <path
        fill="currentColor"
        d="M4.5 8.5A4.5 4.5 0 0 1 9 4h6a4.5 4.5 0 0 1 4.5 4.5v2.74c0 .73.18 1.45.53 2.09l1.07 1.96a.75.75 0 0 1-.66 1.11H3.56a.75.75 0 0 1-.66-1.1l1.07-1.97c.35-.64.53-1.36.53-2.09V8.5zm7.5 13.25c-1.25 0-2.3-.84-2.62-2h5.24a2.75 2.75 0 0 1-2.62 2z"
      />
    </svg>
  )
}
