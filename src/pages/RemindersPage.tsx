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
        className="primary-button full-width"
        onClick={onRequestNewReminder}
      >
        set new
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
                <span className="icon-bubble">e</span>
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
