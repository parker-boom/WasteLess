import { useMemo, useState, type ReactNode } from 'react'
import { relativeLabelFromDays, toMeridiem } from '../app/date'
import type {
  InventoryItem,
  ModalState,
  Reminder,
  ScanDraftItem,
} from '../app/types'

type ModalHostProps = {
  modal: ModalState
  inventory: InventoryItem[]
  reminders: Reminder[]
  scanItems: ScanDraftItem[]
  onClose: () => void
  onSubmitHomeReminder: (itemId: number, remindInDays: number, time: string) => void
  onConfirmHomeRemove: (itemId: number) => void
  onSaveScanItem: (
    scanItemId: number,
    updates: Pick<ScanDraftItem, 'name' | 'quantity' | 'expirationInDays'>,
  ) => void
  onConfirmScanRemove: (scanItemId: number) => void
  onSaveReminder: (
    reminderId: number | undefined,
    inventoryItemId: number,
    remindInDays: number,
    time: string,
  ) => void
  onConfirmReminderCancel: (reminderId: number) => void
}

const dayOptions = [0, 1, 2, 3, 5, 7, 14]
const timeOptions = ['08:00', '09:00', '10:00', '12:00', '15:00', '17:00', '20:00']

export function ModalHost({
  modal,
  inventory,
  reminders,
  scanItems,
  onClose,
  onSubmitHomeReminder,
  onConfirmHomeRemove,
  onSaveScanItem,
  onConfirmScanRemove,
  onSaveReminder,
  onConfirmReminderCancel,
}: ModalHostProps) {
  if (modal.id === 'none') {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true">
        {renderModal({
          modal,
          inventory,
          reminders,
          scanItems,
          onClose,
          onSubmitHomeReminder,
          onConfirmHomeRemove,
          onSaveScanItem,
          onConfirmScanRemove,
          onSaveReminder,
          onConfirmReminderCancel,
        })}
      </section>
    </div>
  )
}

type RenderContext = ModalHostProps

function renderModal(context: RenderContext) {
  const { modal } = context

  switch (modal.id) {
    case 'homeSetReminder':
      return <HomeSetReminderModal {...context} inventoryItemId={modal.inventoryItemId} />
    case 'homeReminderSet':
      return (
        <SuccessModal
          title="Reminder set"
          lines={[
            `${modal.itemName}`,
            `for ${relativeLabelFromDays(modal.remindInDays)}`,
            `${toMeridiem(modal.time)}`,
          ]}
          onClose={context.onClose}
        />
      )
    case 'homeRemoveItem':
      return <HomeRemoveItemModal {...context} inventoryItemId={modal.inventoryItemId} />
    case 'homeItemRemoved':
      return (
        <SuccessModal
          title="Removed from grocery list"
          lines={[modal.itemName]}
          onClose={context.onClose}
        />
      )
    case 'scanEditItem':
      return <ScanEditModal {...context} scanItemId={modal.scanItemId} />
    case 'scanRemoveItem':
      return <ScanRemoveModal {...context} scanItemId={modal.scanItemId} />
    case 'reminderEditor':
      return <ReminderEditorModal {...context} reminderId={modal.reminderId} />
    case 'reminderCancel':
      return <ReminderCancelModal {...context} reminderId={modal.reminderId} />
    case 'reminderRemoved':
      return (
        <SuccessModal
          title="Reminder removed"
          lines={[modal.itemName]}
          onClose={context.onClose}
        />
      )
    default:
      return null
  }
}

type ModalLayoutProps = {
  title: string
  onClose: () => void
  children: ReactNode
}

function ModalLayout({ title, onClose, children }: ModalLayoutProps) {
  return (
    <div className="modal-layout">
      <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
        ×
      </button>
      <h2>{title}</h2>
      <div className="modal-content">{children}</div>
    </div>
  )
}

function HomeSetReminderModal({
  inventory,
  reminders,
  inventoryItemId,
  onClose,
  onSubmitHomeReminder,
}: RenderContext & { inventoryItemId: number }) {
  const item = inventory.find((entry) => entry.id === inventoryItemId)
  const existing = reminders.find((entry) => entry.inventoryItemId === inventoryItemId)
  const [days, setDays] = useState(existing?.remindInDays ?? 2)
  const [time, setTime] = useState(existing?.time ?? '10:00')

  if (!item) {
    return (
      <SuccessModal
        title="Item not found"
        lines={['This inventory item no longer exists.']}
        onClose={onClose}
      />
    )
  }

  return (
    <ModalLayout title={existing ? 'Edit Reminder' : 'Set Reminder'} onClose={onClose}>
      <p className="modal-highlight">
        {item.name}, x{item.quantity}
      </p>

      <label className="field-label">
        Remind me in:
        <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
          {dayOptions.map((option) => (
            <option key={option} value={option}>
              {option === 0 ? 'Today' : `${option} Day${option === 1 ? '' : 's'}`}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        At:
        <select value={time} onChange={(event) => setTime(event.target.value)}>
          {timeOptions.map((option) => (
            <option key={option} value={option}>
              {toMeridiem(option)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="primary-button full-width"
        onClick={() => onSubmitHomeReminder(item.id, days, time)}
      >
        {existing ? 'save changes' : 'confirm'}
      </button>
    </ModalLayout>
  )
}

function HomeRemoveItemModal({
  inventory,
  inventoryItemId,
  onClose,
  onConfirmHomeRemove,
}: RenderContext & { inventoryItemId: number }) {
  const item = inventory.find((entry) => entry.id === inventoryItemId)

  if (!item) {
    return (
      <SuccessModal
        title="Item not found"
        lines={['This inventory item no longer exists.']}
        onClose={onClose}
      />
    )
  }

  return (
    <ModalLayout title="Remove item?" onClose={onClose}>
      <p className="modal-highlight">
        {item.name}, x{item.quantity}
      </p>
      <p className="inventory-meta">Are you sure you want to remove this from the grocery list?</p>

      <div className="split-actions">
        <button
          type="button"
          className="danger-button"
          onClick={() => onConfirmHomeRemove(item.id)}
        >
          yes, remove
        </button>
        <button type="button" className="ghost-button" onClick={onClose}>
          no, back
        </button>
      </div>
    </ModalLayout>
  )
}

function ScanEditModal({
  scanItems,
  scanItemId,
  onClose,
  onSaveScanItem,
}: RenderContext & { scanItemId: number }) {
  const item = scanItems.find((entry) => entry.id === scanItemId)

  const [name, setName] = useState(item?.name ?? '')
  const [quantity, setQuantity] = useState(item?.quantity ?? 1)
  const [expirationInDays, setExpirationInDays] = useState(item?.expirationInDays ?? 7)

  if (!item) {
    return (
      <SuccessModal
        title="Scanned item not found"
        lines={['It may have been removed already.']}
        onClose={onClose}
      />
    )
  }

  return (
    <ModalLayout title="Edit item" onClose={onClose}>
      <label className="field-label">
        Name:
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <div className="field-label">
        Quantity:
        <div className="quantity-field">
          <button
            type="button"
            className="icon-action"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            <span className="icon-bubble">-</span>
          </button>
          <p className="quantity-value">{quantity.toString().padStart(2, '0')}</p>
          <button
            type="button"
            className="icon-action"
            onClick={() => setQuantity((value) => value + 1)}
          >
            <span className="icon-bubble">+</span>
          </button>
        </div>
      </div>

      <label className="field-label">
        Expiration:
        <select
          value={expirationInDays}
          onChange={(event) => setExpirationInDays(Number(event.target.value))}
        >
          {[2, 4, 7, 10, 14, 21].map((option) => (
            <option key={option} value={option}>
              {option < 7 ? `${option} Days` : `${Math.ceil(option / 7)} Weeks`}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="primary-button full-width"
        onClick={() =>
          onSaveScanItem(item.id, {
            name: name.trim() || item.name,
            quantity,
            expirationInDays,
          })
        }
      >
        confirm
      </button>
    </ModalLayout>
  )
}

function ScanRemoveModal({
  scanItems,
  scanItemId,
  onClose,
  onConfirmScanRemove,
}: RenderContext & { scanItemId: number }) {
  const item = scanItems.find((entry) => entry.id === scanItemId)

  if (!item) {
    return (
      <SuccessModal
        title="Scanned item not found"
        lines={['It may have been removed already.']}
        onClose={onClose}
      />
    )
  }

  return (
    <ModalLayout title="Remove from scan?" onClose={onClose}>
      <p className="modal-highlight">
        {item.name}, x{item.quantity}
      </p>

      <div className="split-actions">
        <button
          type="button"
          className="danger-button"
          onClick={() => onConfirmScanRemove(item.id)}
        >
          yes, remove
        </button>
        <button type="button" className="ghost-button" onClick={onClose}>
          no, back
        </button>
      </div>
    </ModalLayout>
  )
}

function ReminderEditorModal({
  reminderId,
  inventory,
  reminders,
  onClose,
  onSaveReminder,
}: RenderContext & { reminderId?: number }) {
  const selectedReminder = useMemo(
    () => reminders.find((entry) => entry.id === reminderId),
    [reminders, reminderId],
  )

  const [inventoryItemId, setInventoryItemId] = useState(
    selectedReminder?.inventoryItemId ?? inventory[0]?.id ?? 0,
  )
  const [days, setDays] = useState(selectedReminder?.remindInDays ?? 2)
  const [time, setTime] = useState(selectedReminder?.time ?? '10:00')

  if (inventory.length === 0) {
    return (
      <SuccessModal
        title="No inventory items"
        lines={['Add an item before creating a reminder.']}
        onClose={onClose}
      />
    )
  }

  return (
    <ModalLayout
      title={selectedReminder ? 'Edit reminder' : 'New reminder'}
      onClose={onClose}
    >
      <label className="field-label">
        For:
        <select
          value={inventoryItemId}
          onChange={(event) => setInventoryItemId(Number(event.target.value))}
        >
          {inventory.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        Remind me in:
        <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
          {dayOptions.map((option) => (
            <option key={option} value={option}>
              {option === 0 ? 'Today' : `${option} Day${option === 1 ? '' : 's'}`}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        At:
        <select value={time} onChange={(event) => setTime(event.target.value)}>
          {timeOptions.map((option) => (
            <option key={option} value={option}>
              {toMeridiem(option)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="primary-button full-width"
        onClick={() => onSaveReminder(selectedReminder?.id, inventoryItemId, days, time)}
      >
        confirm
      </button>
    </ModalLayout>
  )
}

function ReminderCancelModal({
  reminderId,
  reminders,
  onClose,
  onConfirmReminderCancel,
}: RenderContext & { reminderId: number }) {
  const reminder = reminders.find((entry) => entry.id === reminderId)

  if (!reminder) {
    return (
      <SuccessModal
        title="Reminder not found"
        lines={['It may have already been removed.']}
        onClose={onClose}
      />
    )
  }

  return (
    <ModalLayout title="Cancel reminder?" onClose={onClose}>
      <p className="modal-highlight">{reminder.itemName}</p>
      <p className="inventory-meta">
        Set for {relativeLabelFromDays(reminder.remindInDays)}, {toMeridiem(reminder.time)}
      </p>

      <div className="split-actions">
        <button
          type="button"
          className="danger-button"
          onClick={() => onConfirmReminderCancel(reminder.id)}
        >
          yes, cancel
        </button>
        <button type="button" className="ghost-button" onClick={onClose}>
          no, back
        </button>
      </div>
    </ModalLayout>
  )
}

type SuccessModalProps = {
  title: string
  lines: string[]
  onClose: () => void
}

function SuccessModal({ title, lines, onClose }: SuccessModalProps) {
  return (
    <ModalLayout title={title} onClose={onClose}>
      {lines.map((line) => (
        <p key={line} className="modal-highlight">
          {line}
        </p>
      ))}
      <button type="button" className="primary-button full-width" onClick={onClose}>
        close
      </button>
    </ModalLayout>
  )
}
