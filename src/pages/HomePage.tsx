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
              <div className="inventory-expiry">{expiryLabel(item.expirationDate)}</div>

              <div className="inventory-body">
                <p className="inventory-name">{item.name}</p>
                <p className="inventory-meta">
                  x{item.quantity} • {item.category}
                </p>
              </div>

              <div className="inventory-actions">
                <button
                  type="button"
                  className="icon-action"
                  onClick={() => onRequestSetReminder(item.id)}
                  title="Set reminder"
                >
                  <span className="icon-bubble">!</span>
                  <span className="icon-action-label">
                    {reminder ? `${reminder.remindInDays}d` : 'none'}
                  </span>
                </button>

                <button
                  type="button"
                  className="icon-action danger"
                  onClick={() => onRequestRemoveItem(item.id)}
                  title="Remove item"
                >
                  <span className="icon-bubble">x</span>
                </button>
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
