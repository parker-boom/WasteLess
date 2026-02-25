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
                <span className="icon-bubble">e</span>
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
