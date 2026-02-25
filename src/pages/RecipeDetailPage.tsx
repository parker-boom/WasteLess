import { recipeImageByName } from '../app/content'
import type { InventoryItem, ProfileRecipe } from '../app/types'

type RecipeDetailPageProps = {
  recipe: ProfileRecipe
  inventory: InventoryItem[]
  onBack: () => void
}

export function RecipeDetailPage({
  recipe,
  inventory,
  onBack,
}: RecipeDetailPageProps) {
  const inventorySet = new Set(inventory.map((item) => item.name.toLowerCase()))

  return (
    <section className="screen">
      <button type="button" className="text-link" onClick={onBack}>
        ← back to recipes
      </button>

      <img src={recipeImageByName(recipe.name)} alt={recipe.name} className="detail-image" />

      <header className="screen-header compact">
        <h1 className="screen-title">{recipe.name}</h1>
        <p className="inventory-meta">{recipe.description}</p>
      </header>

      <div className="recipe-stats">
        <div>
          <p className="stat-label">Calories</p>
          <p className="stat-value">{recipe.calories}</p>
        </div>
        <div>
          <p className="stat-label">Prep</p>
          <p className="stat-value">{recipe.prepTimeMinutes} min</p>
        </div>
        <div>
          <p className="stat-label">Cook</p>
          <p className="stat-value">{recipe.cookTimeMinutes} min</p>
        </div>
      </div>

      <section className="detail-section">
        <h2>Ingredients</h2>
        <ul>
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient}>
              <span>{ingredient}</span>
              <span
                className={`detail-pill ${
                  inventorySet.has(ingredient.toLowerCase()) ? 'in-stock' : 'missing'
                }`}
              >
                {inventorySet.has(ingredient.toLowerCase()) ? 'in pantry' : 'missing'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <h2>Instructions</h2>
        <ol>
          {recipe.instructions.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ol>
      </section>
    </section>
  )
}
