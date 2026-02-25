import { useMemo, useState } from 'react'
import { toMeridiem } from '../app/date'
import type { Reminder } from '../app/types'

type RemindersPageProps = {
  reminders: Reminder[]
  onRequestNewReminder: () => void
  onRequestEditReminder: (reminderId: number) => void
  onRequestCancelReminder: (reminderId: number) => void
}

export function RemindersPage({
  reminders,
  onRequestNewReminder,
  onRequestEditReminder,
  onRequestCancelReminder,
}: RemindersPageProps) {
  const [visibleCount, setVisibleCount] = useState(4)

  const orderedReminders = useMemo(
    () => [...reminders].sort((a, b) => a.remindInDays - b.remindInDays),
    [reminders],
  )

  const visibleReminders = orderedReminders.slice(0, visibleCount)
  const hasMore = orderedReminders.length > visibleCount

  return (
    <section className="screen">
      <header className="screen-header">
        <p className="screen-overline">Planner</p>
        <h1 className="screen-title">Current reminders</h1>
      </header>

      <button
        type="button"
        className="primary-button full-width reminders-new-button"
        onClick={onRequestNewReminder}
      >
        <PlusGlyph />
        <span>set new</span>
      </button>

      <div className="list-stack">
        {visibleReminders.length === 0 ? (
          <p className="empty-state">
            No reminders yet. Set one now to get ahead of expiration dates.
          </p>
        ) : null}

        {visibleReminders.map((reminder) => (
          <article key={reminder.id} className="reminder-card">
            <div className="reminder-main">
              <p className="inventory-name">{reminder.itemName}</p>
              <p className="inventory-meta">
                in {reminder.remindInDays} day{reminder.remindInDays === 1 ? '' : 's'} at{' '}
                {toMeridiem(reminder.time)}
              </p>
            </div>

            <div className="reminder-actions">
              <button
                type="button"
                className="icon-action"
                onClick={() => onRequestEditReminder(reminder.id)}
                title="Edit reminder"
              >
                <span className="icon-bubble">
                  <PencilGlyph />
                </span>
              </button>

              <button
                type="button"
                className="icon-action danger"
                onClick={() => onRequestCancelReminder(reminder.id)}
                title="Cancel reminder"
              >
                <span className="icon-bubble">x</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="ghost-button full-width"
        onClick={() => setVisibleCount((count) => count + 4)}
        disabled={!hasMore}
      >
        load more
      </button>
    </section>
  )
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

function PlusGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="reminders-new-plus">
      <path
        fill="currentColor"
        d="M12 4.5a.75.75 0 0 1 .75.75v6h6a.75.75 0 0 1 0 1.5h-6v6a.75.75 0 0 1-1.5 0v-6h-6a.75.75 0 0 1 0-1.5h6v-6A.75.75 0 0 1 12 4.5z"
      />
    </svg>
  )
}
