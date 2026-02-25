import stagedProfileJson from '../content/stagedContentProfile.json'
import { daysUntil } from './date'
import type {
  InventoryItem,
  Reminder,
  ScanDraftItem,
  StagedContentProfile,
} from './types'

const starterQuantityByName: Record<string, number> = {
  'Chicken Breast': 2,
  Rice: 1,
  Broccoli: 1,
  Garlic: 3,
  'Soy Sauce': 1,
}

export const stagedProfile = stagedProfileJson as StagedContentProfile

export function createInitialInventory(): InventoryItem[] {
  return stagedProfile.ingredients.map((ingredient) => ({
    id: ingredient.id,
    sourceIngredientId: ingredient.id,
    name: ingredient.name,
    category: ingredient.category,
    caloriesPerUnit: ingredient.caloriesPerUnit,
    expirationDate: ingredient.expirationDate,
    quantity: starterQuantityByName[ingredient.name] ?? 1,
  }))
}

export function createInitialReminders(inventory: InventoryItem[]): Reminder[] {
  const soonest = [...inventory]
    .sort((a, b) => daysUntil(a.expirationDate) - daysUntil(b.expirationDate))
    .slice(0, 2)

  return soonest.map((item, index) => ({
    id: index + 1,
    inventoryItemId: item.id,
    itemName: item.name,
    remindInDays: Math.max(daysUntil(item.expirationDate) - 1, 0),
    time: index === 0 ? '09:00' : '10:00',
  }))
}

export function createMockScannedItems(): ScanDraftItem[] {
  const demo = stagedProfile.demoIngredientToAddLive
  const broccoli = stagedProfile.ingredients.find((item) => item.name === 'Broccoli')
  const chicken = stagedProfile.ingredients.find(
    (item) => item.name === 'Chicken Breast',
  )

  const fallback = stagedProfile.ingredients[0]

  return [
    {
      id: 1001,
      name: demo.name,
      category: demo.category,
      caloriesPerUnit: demo.caloriesPerUnit,
      quantity: 2,
      expirationInDays: 5,
    },
    {
      id: 1002,
      name: (broccoli ?? fallback).name,
      category: (broccoli ?? fallback).category,
      caloriesPerUnit: (broccoli ?? fallback).caloriesPerUnit,
      quantity: 1,
      expirationInDays: 4,
    },
    {
      id: 1003,
      name: (chicken ?? fallback).name,
      category: (chicken ?? fallback).category,
      caloriesPerUnit: (chicken ?? fallback).caloriesPerUnit,
      quantity: 1,
      expirationInDays: 7,
    },
  ]
}

export function recipeImageByName(recipeName: string): string {
  const imageMap: Record<string, string> = {
    'Garlic Soy Chicken Bowl': '/GarlicSoyChickenBowl.jpg',
    'Lemon Garlic Chicken': '/LemonGarlicChicken.jpg',
    'Vegetable Fried Rice': '/VegatableFriedRice.jpg',
  }

  return imageMap[recipeName] ?? '/VegatableFriedRice.jpg'
}

export function nextId<T extends { id: number }>(items: T[]): number {
  return items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
}
