import { type ReactNode, useMemo, useState } from 'react'
import { addDaysIso } from './app/date'
import {
  createInitialInventory,
  createInitialReminders,
  createMockScannedItems,
  nextId,
  stagedProfile,
} from './app/content'
import type {
  InventoryItem,
  MainTab,
  ModalState,
  Reminder,
  ScanDraftItem,
  Screen,
} from './app/types'
import { AppScaffold } from './components/AppScaffold'
import { ModalHost } from './components/ModalHost'
import { AddItemsConfirmPage } from './pages/AddItemsConfirmPage'
import { AddItemsScanPage } from './pages/AddItemsScanPage'
import { HomePage } from './pages/HomePage'
import { RecipeDetailPage } from './pages/RecipeDetailPage'
import { RecipesPage } from './pages/RecipesPage'
import { RemindersPage } from './pages/RemindersPage'

const initialInventorySeed = createInitialInventory()
const initialReminderSeed = createInitialReminders(initialInventorySeed)

function App() {
  const [inventory, setInventory] = useState<InventoryItem[]>(
    () => initialInventorySeed,
  )
  const [reminders, setReminders] = useState<Reminder[]>(() => initialReminderSeed)
  const [scanItems, setScanItems] = useState<ScanDraftItem[]>([])
  const [screen, setScreen] = useState<Screen>({ id: 'home' })
  const [modal, setModal] = useState<ModalState>({ id: 'none' })

  const activeTab = useMemo<MainTab>(() => {
    if (screen.id === 'recipes' || screen.id === 'recipeDetail') {
      return 'recipes'
    }
    if (screen.id === 'reminders') {
      return 'reminders'
    }
    return 'home'
  }, [screen.id])

  const showBottomNav = screen.id !== 'addItemsScan' && screen.id !== 'addItemsConfirm'

  const goToTab = (tab: MainTab) => {
    if (tab === 'home') {
      setScreen({ id: 'home' })
      return
    }
    if (tab === 'recipes') {
      setScreen({ id: 'recipes' })
      return
    }
    setScreen({ id: 'reminders' })
  }

  const selectedRecipe =
    screen.id === 'recipeDetail'
      ? stagedProfile.recipes.find((recipe) => recipe.id === screen.recipeId)
      : null

  const submitHomeReminder = (
    inventoryItemId: number,
    remindInDays: number,
    time: string,
  ) => {
    const item = inventory.find((entry) => entry.id === inventoryItemId)
    if (!item) {
      setModal({ id: 'none' })
      return
    }

    setReminders((previous) => {
      const existingReminder = previous.find(
        (entry) => entry.inventoryItemId === inventoryItemId,
      )

      if (existingReminder) {
        return previous.map((entry) =>
          entry.id === existingReminder.id
            ? { ...entry, remindInDays, time, itemName: item.name }
            : entry,
        )
      }

      return [
        ...previous,
        {
          id: nextId(previous),
          inventoryItemId,
          itemName: item.name,
          remindInDays,
          time,
        },
      ]
    })

    setModal({
      id: 'homeReminderSet',
      itemName: item.name,
      remindInDays,
      time,
    })
  }

  const confirmHomeRemove = (inventoryItemId: number) => {
    const item = inventory.find((entry) => entry.id === inventoryItemId)
    setInventory((previous) => previous.filter((entry) => entry.id !== inventoryItemId))
    setReminders((previous) =>
      previous.filter((entry) => entry.inventoryItemId !== inventoryItemId),
    )

    if (!item) {
      setModal({ id: 'none' })
      return
    }

    setModal({ id: 'homeItemRemoved', itemName: item.name })
  }

  const saveScanItem = (
    scanItemId: number,
    updates: Pick<ScanDraftItem, 'name' | 'quantity' | 'expirationInDays'>,
  ) => {
    setScanItems((previous) =>
      previous.map((entry) =>
        entry.id === scanItemId
          ? {
              ...entry,
              name: updates.name,
              quantity: updates.quantity,
              expirationInDays: updates.expirationInDays,
            }
          : entry,
      ),
    )
    setModal({ id: 'none' })
  }

  const confirmScanRemove = (scanItemId: number) => {
    setScanItems((previous) => previous.filter((entry) => entry.id !== scanItemId))
    setModal({ id: 'none' })
  }

  const saveReminder = (
    reminderId: number | undefined,
    inventoryItemId: number,
    remindInDays: number,
    time: string,
  ) => {
    const item = inventory.find((entry) => entry.id === inventoryItemId)
    if (!item) {
      setModal({ id: 'none' })
      return
    }

    setReminders((previous) => {
      if (typeof reminderId === 'number') {
        return previous.map((entry) =>
          entry.id === reminderId
            ? { ...entry, inventoryItemId, itemName: item.name, remindInDays, time }
            : entry,
        )
      }

      return [
        ...previous,
        {
          id: nextId(previous),
          inventoryItemId,
          itemName: item.name,
          remindInDays,
          time,
        },
      ]
    })

    setModal({ id: 'none' })
  }

  const confirmReminderCancel = (reminderId: number) => {
    const reminder = reminders.find((entry) => entry.id === reminderId)
    setReminders((previous) => previous.filter((entry) => entry.id !== reminderId))

    if (!reminder) {
      setModal({ id: 'none' })
      return
    }

    setModal({ id: 'reminderRemoved', itemName: reminder.itemName })
  }

  const openAddItemsScan = () => {
    setScreen({ id: 'addItemsScan' })
    setModal({ id: 'none' })
  }

  const runMockScan = () => {
    setScanItems(createMockScannedItems())
    setScreen({ id: 'addItemsConfirm' })
  }

  const confirmScannedItems = () => {
    setInventory((previous) => {
      const startingId = nextId(previous)
      const scannedAsInventory = scanItems.map((item, index) => ({
        id: startingId + index,
        name: item.name,
        category: item.category,
        caloriesPerUnit: item.caloriesPerUnit,
        expirationDate: addDaysIso(item.expirationInDays),
        quantity: item.quantity,
      }))

      return [...previous, ...scannedAsInventory]
    })
    setScanItems([])
    setScreen({ id: 'home' })
  }

  let content: ReactNode = null

  if (screen.id === 'home') {
    content = (
      <HomePage
        items={inventory}
        reminders={reminders}
        onRequestSetReminder={(inventoryItemId) =>
          setModal({ id: 'homeSetReminder', inventoryItemId })
        }
        onRequestRemoveItem={(inventoryItemId) =>
          setModal({ id: 'homeRemoveItem', inventoryItemId })
        }
        onOpenAddItems={openAddItemsScan}
      />
    )
  } else if (screen.id === 'recipes') {
    content = (
      <RecipesPage
        recipes={stagedProfile.recipes}
        inventory={inventory}
        onOpenRecipe={(recipeId) => setScreen({ id: 'recipeDetail', recipeId })}
      />
    )
  } else if (screen.id === 'recipeDetail') {
    content = selectedRecipe ? (
      <RecipeDetailPage
        recipe={selectedRecipe}
        inventory={inventory}
        onBack={() => setScreen({ id: 'recipes' })}
      />
    ) : (
      <section className="screen">
        <p className="empty-state">Recipe not found.</p>
      </section>
    )
  } else if (screen.id === 'reminders') {
    content = (
      <RemindersPage
        reminders={reminders}
        onRequestNewReminder={() => setModal({ id: 'reminderEditor' })}
        onRequestEditReminder={(reminderId) =>
          setModal({ id: 'reminderEditor', reminderId })
        }
        onRequestCancelReminder={(reminderId) =>
          setModal({ id: 'reminderCancel', reminderId })
        }
      />
    )
  } else if (screen.id === 'addItemsScan') {
    content = (
      <AddItemsScanPage onBack={() => setScreen({ id: 'home' })} onDone={runMockScan} />
    )
  } else if (screen.id === 'addItemsConfirm') {
    content = (
      <AddItemsConfirmPage
        items={scanItems}
        onBack={() => setScreen({ id: 'addItemsScan' })}
        onRequestEdit={(scanItemId) => setModal({ id: 'scanEditItem', scanItemId })}
        onRequestRemove={(scanItemId) => setModal({ id: 'scanRemoveItem', scanItemId })}
        onConfirm={confirmScannedItems}
      />
    )
  }

  return (
    <>
      <AppScaffold activeTab={activeTab} showBottomNav={showBottomNav} onNavigate={goToTab}>
        {content}
      </AppScaffold>

      <ModalHost
        modal={modal}
        inventory={inventory}
        reminders={reminders}
        scanItems={scanItems}
        onClose={() => setModal({ id: 'none' })}
        onSubmitHomeReminder={submitHomeReminder}
        onConfirmHomeRemove={confirmHomeRemove}
        onSaveScanItem={saveScanItem}
        onConfirmScanRemove={confirmScanRemove}
        onSaveReminder={saveReminder}
        onConfirmReminderCancel={confirmReminderCancel}
      />
    </>
  )
}

export default App
