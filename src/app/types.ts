export type MainTab = 'home' | 'recipes' | 'reminders'

export type Screen =
  | { id: 'home' }
  | { id: 'recipes' }
  | { id: 'recipeDetail'; recipeId: number }
  | { id: 'reminders' }
  | { id: 'addItemsScan' }
  | { id: 'addItemsConfirm' }

export type ProfileIngredient = {
  id: number
  name: string
  category: string
  caloriesPerUnit: number
  expirationDate: string
}

export type ProfileRecipe = {
  id: number
  name: string
  description: string
  calories: number
  prepTimeMinutes: number
  cookTimeMinutes: number
  totalTimeMinutes: number
  ingredients: string[]
  instructions: string[]
}

export type StagedContentProfile = {
  ingredients: ProfileIngredient[]
  demoIngredientToAddLive: ProfileIngredient
  recipes: ProfileRecipe[]
}

export type InventoryItem = {
  id: number
  sourceIngredientId?: number
  name: string
  category: string
  caloriesPerUnit: number
  expirationDate: string
  quantity: number
}

export type Reminder = {
  id: number
  inventoryItemId: number
  itemName: string
  remindInDays: number
  time: string
}

export type ScanDraftItem = {
  id: number
  name: string
  category: string
  caloriesPerUnit: number
  quantity: number
  expirationInDays: number
}

export type ModalState =
  | { id: 'none' }
  | { id: 'homeSetReminder'; inventoryItemId: number }
  | {
      id: 'homeReminderSet'
      itemName: string
      remindInDays: number
      time: string
    }
  | { id: 'homeRemoveItem'; inventoryItemId: number }
  | { id: 'homeItemRemoved'; itemName: string }
  | { id: 'scanEditItem'; scanItemId: number }
  | { id: 'scanRemoveItem'; scanItemId: number }
  | { id: 'reminderEditor'; reminderId?: number }
  | { id: 'reminderCancel'; reminderId: number }
  | { id: 'reminderRemoved'; itemName: string }
