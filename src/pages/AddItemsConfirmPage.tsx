import type { ScanDraftItem } from '../app/types'

type AddItemsConfirmPageProps = {
  items: ScanDraftItem[]
  onBack: () => void
  onRequestEdit: (scanItemId: number) => void
  onRequestRemove: (scanItemId: number) => void
  onConfirm: () => void
}

export function AddItemsConfirmPage({
  items,
  onBack,
  onRequestEdit,
  onRequestRemove,
  onConfirm,
}: AddItemsConfirmPageProps) {
  return (
    <section className="screen scan-screen">
      <header className="screen-header">
        <p className="screen-overline">Add Items</p>
        <h1 className="screen-title">Scanned items</h1>
        <p className="inventory-meta">Confirm details before adding to inventory.</p>
      </header>

      <div className="list-stack">
        {items.length === 0 ? (
          <p className="empty-state">
            No items left in this scan. Go back to scan and try again.
          </p>
        ) : null}

        {items.map((item) => (
          <article key={item.id} className="inventory-card scan-card">
            <p className="scan-quantity">x{item.quantity}</p>
            <div className="inventory-expiry">{expiryLabelFromDays(item.expirationInDays)}</div>

            <div className="inventory-body">
              <p className="inventory-name">{item.name}</p>
              <p className="inventory-meta">
                {item.category} • {item.caloriesPerUnit} cal / unit
              </p>
            </div>

            <div className="reminder-actions">
              <button
                type="button"
                className="icon-action"
                onClick={() => onRequestEdit(item.id)}
                title="Edit scanned item"
              >
                <span className="icon-bubble">
                  <PencilGlyph />
                </span>
              </button>
              <button
                type="button"
                className="icon-action danger"
                onClick={() => onRequestRemove(item.id)}
                title="Remove scanned item"
              >
                <span className="icon-bubble">x</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="split-actions">
        <button type="button" className="ghost-button" onClick={onBack}>
          back
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={onConfirm}
          disabled={items.length === 0}
        >
          confirm
        </button>
      </div>
    </section>
  )
}

function expiryLabelFromDays(days: number): string {
  if (days <= 0) {
    return 'Today'
  }
  if (days === 1) {
    return 'Tomorrow'
  }
  if (days < 7) {
    return `${days} Days`
  }

  const weeks = Math.ceil(days / 7)
  return weeks === 1 ? '1 Week' : `${weeks} Weeks`
}

function PencilGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.86 3.49a2 2 0 0 1 2.83 0l.82.82a2 2 0 0 1 0 2.83l-9.5 9.5a1 1 0 0 1-.45.26l-3.44.98a.75.75 0 0 1-.92-.92l.98-3.44a1 1 0 0 1 .26-.45l9.42-9.58zM7.67 14.48l-.58 2.05 2.05-.58 8.79-8.79-1.47-1.47-8.79 8.79z"
      />
    </svg>
  )
}
