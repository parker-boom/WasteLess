import { recipeImageByName } from '../app/content'
import type { InventoryItem, ProfileRecipe } from '../app/types'

type RecipesPageProps = {
  recipes: ProfileRecipe[]
  inventory: InventoryItem[]
  onOpenRecipe: (recipeId: number) => void
}

export function RecipesPage({ recipes, inventory, onOpenRecipe }: RecipesPageProps) {
  const inventorySet = new Set(inventory.map((item) => item.name.toLowerCase()))

  return (
    <section className="screen">
      <header className="screen-header">
        <p className="screen-overline">Kitchen</p>
        <h1 className="screen-title">Suggested recipes</h1>
      </header>

      <div className="list-stack">
        {recipes.map((recipe) => (
          <article
            key={recipe.id}
            className="recipe-card"
            onClick={() => onOpenRecipe(recipe.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                onOpenRecipe(recipe.id)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <img
              src={recipeImageByName(recipe.name)}
              alt={recipe.name}
              className="recipe-image"
            />

            <div className="recipe-content">
              <div className="recipe-headline">
                <p className="recipe-name">{recipe.name}</p>
                <p className="recipe-calories">{recipe.calories} cal</p>
              </div>

              <p className="inventory-meta">
                Prep {recipe.prepTimeMinutes} min • Cook {recipe.cookTimeMinutes} min
              </p>

              <div className="chip-row">
                {recipe.ingredients.slice(0, 4).map((ingredient) => {
                  const hasIngredient = inventorySet.has(ingredient.toLowerCase())

                  return (
                    <span
                      key={ingredient}
                      className={`ingredient-chip ${
                        hasIngredient ? 'in-stock' : 'missing'
                      }`}
                    >
                      {ingredient}
                    </span>
                  )
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
