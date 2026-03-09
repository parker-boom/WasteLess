import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { beforeExpirationLabel, daysUntil, toMeridiem } from '../app/date'
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
  onConfirmHomeRemove: (itemId: number, removeQuantity: number) => void
  onSaveScanItem: (
    scanItemId: number,
    updates: Pick<ScanDraftItem, 'name' | 'quantity' | 'expirationDate'>,
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

const reminderDayPresets = [0, 1, 2, 3, 5, 7, 10, 14, 21, 30]
const timeOptions = createHourlyTimeOptions(7, 21)

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
          title="Reminder Set"
          lines={[
            `${modal.itemName}`,
            `${beforeExpirationLabel(modal.remindInDays)}`,
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
          title="Removed from Inventory"
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
          title="Reminder Removed"
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
        X
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
  onConfirmReminderCancel,
}: RenderContext & { inventoryItemId: number }) {
  const item = inventory.find((entry) => entry.id === inventoryItemId)
  const existing = reminders.find((entry) => entry.inventoryItemId === inventoryItemId)
  const maxReminderDays = item ? Math.max(daysUntil(item.expirationDate), 0) : 0
  const reminderDayOptions = buildReminderDayOptions(maxReminderDays)
  const [days, setDays] = useState(existing?.remindInDays ?? 1)
  const [time, setTime] = useState(existing?.time ?? '10:00')

  useEffect(() => {
    setDays((value) => clampReminderDays(value, maxReminderDays))
  }, [maxReminderDays])

  if (!item) {
    return (
      <SuccessModal
        title="Item Not Found"
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
        Remind me:
        <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
          {reminderDayOptions.map((option) => (
            <option key={option} value={option}>
              {reminderOptionLabel(option)}
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

      {existing ? (
        <div className="split-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => onConfirmReminderCancel(existing.id)}
          >
            Cancel Reminder
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => onSubmitHomeReminder(item.id, days, time)}
          >
            Save
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="primary-button full-width"
          onClick={() => onSubmitHomeReminder(item.id, days, time)}
        >
          Save
        </button>
      )}
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
  const [removeQuantity, setRemoveQuantity] = useState(1)

  if (!item) {
    return (
      <SuccessModal
        title="Item Not Found"
        lines={['This inventory item no longer exists.']}
        onClose={onClose}
      />
    )
  }

  return (
    <ModalLayout title={`Remove ${item.name}`} onClose={onClose}>
      <p className="modal-highlight">{item.quantity} total.</p>
      <p className="inventory-meta">How many do you want to remove?</p>
      <div className="field-label">
        <select
          aria-label="Amount to remove"
          value={removeQuantity}
          onChange={(event) => setRemoveQuantity(Number(event.target.value))}
        >
          {Array.from({ length: item.quantity }, (_, index) => {
            const quantity = index + 1
            return (
              <option key={quantity} value={quantity}>
                {quantity}
              </option>
            )
          })}
        </select>
      </div>

      <div className="split-actions">
        <button type="button" className="ghost-button" onClick={onClose}>
          Back
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => onConfirmHomeRemove(item.id, removeQuantity)}
        >
          Remove {removeQuantity}
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
  const [expirationDate, setExpirationDate] = useState(() =>
    toDateInputValue(item?.expirationDate),
  )

  if (!item) {
    return (
      <SuccessModal
        title="Scanned Item Not Found"
        lines={['It may have been removed already.']}
        onClose={onClose}
      />
    )
  }

  return (
    <ModalLayout title="Edit Item" onClose={onClose}>
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
        Expires on:
        <input
          type="date"
          min={todayDateValue()}
          value={expirationDate}
          onChange={(event) => setExpirationDate(event.target.value)}
        />
      </label>

      <button
        type="button"
        className="primary-button full-width"
        onClick={() =>
          onSaveScanItem(item.id, {
            name: name.trim() || item.name,
            quantity,
            expirationDate: expirationDate || toDateInputValue(item.expirationDate),
          })
        }
      >
        Save
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
        title="Scanned Item Not Found"
        lines={['It may have been removed already.']}
        onClose={onClose}
      />
    )
  }

  return (
    <ModalLayout title={`Remove ${item.name}`} onClose={onClose}>
      <p className="modal-highlight">{item.quantity} total.</p>
      <p className="inventory-meta">Remove this item from the scan?</p>

      <div className="split-actions">
        <button type="button" className="ghost-button" onClick={onClose}>
          Back
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => onConfirmScanRemove(item.id)}
        >
          Remove
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
  const [days, setDays] = useState(selectedReminder?.remindInDays ?? 1)
  const [time, setTime] = useState(selectedReminder?.time ?? '10:00')
  const selectedItem = inventory.find((item) => item.id === inventoryItemId)
  const maxReminderDays = selectedItem ? Math.max(daysUntil(selectedItem.expirationDate), 0) : 0
  const reminderDayOptions = buildReminderDayOptions(maxReminderDays)

  useEffect(() => {
    setDays((value) => clampReminderDays(value, maxReminderDays))
  }, [maxReminderDays])

  if (inventory.length === 0) {
    return (
      <SuccessModal
        title="No Inventory Items"
        lines={['Add an item before creating a reminder.']}
        onClose={onClose}
      />
    )
  }

  return (
    <ModalLayout
      title={selectedReminder ? 'Edit Reminder' : 'New Reminder'}
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
        Remind me:
        <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
          {reminderDayOptions.map((option) => (
            <option key={option} value={option}>
              {reminderOptionLabel(option)}
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
        Save
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
        title="Reminder Not Found"
        lines={['It may have already been removed.']}
        onClose={onClose}
      />
    )
  }

  return (
    <ModalLayout title="Cancel Reminder?" onClose={onClose}>
      <p className="modal-highlight">{reminder.itemName}</p>
      <p className="inventory-meta">
        Set {beforeExpirationLabel(reminder.remindInDays)}, {toMeridiem(reminder.time)}
      </p>

      <div className="split-actions">
        <button type="button" className="ghost-button" onClick={onClose}>
          Back
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => onConfirmReminderCancel(reminder.id)}
        >
          Cancel Reminder
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
        Close
      </button>
    </ModalLayout>
  )
}

function toDateInputValue(value: string | undefined): string {
  if (!value) {
    return addDaysToDateValue(7)
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return addDaysToDateValue(7)
  }

  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(
    2,
    '0',
  )}-${String(parsed.getUTCDate()).padStart(2, '0')}`
}

function todayDateValue(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`
}

function addDaysToDateValue(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function createHourlyTimeOptions(startHour: number, endHour: number): string[] {
  const options: string[] = []
  for (let hour = startHour; hour <= endHour; hour += 1) {
    options.push(`${hour.toString().padStart(2, '0')}:00`)
  }
  return options
}

function buildReminderDayOptions(maxReminderDays: number): number[] {
  const bounded = Math.max(0, Math.min(Math.floor(maxReminderDays), 30))
  const options = reminderDayPresets.filter((option) => option <= bounded)

  if (!options.includes(bounded)) {
    options.push(bounded)
  }
  if (options.length === 0) {
    options.push(0)
  }

  return [...new Set(options)].sort((a, b) => a - b)
}

function clampReminderDays(value: number, maxReminderDays: number): number {
  const boundedMax = Math.max(0, Math.min(Math.floor(maxReminderDays), 30))
  return Math.max(0, Math.min(value, boundedMax))
}

function reminderOptionLabel(days: number): string {
  if (days <= 0) {
    return 'On expiration day'
  }
  if (days === 1) {
    return '1 day before expiration'
  }
  return `${days} days before expiration`
}

