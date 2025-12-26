<template>
  <div class="add-recipe max-w-2xl mx-auto">
    <h2 class="mb-4">Add a New Recipe</h2>
    <RecipeForm />
  </div>
</template>

<script>
import RecipeForm from '../components/RecipeForm.vue'

export default {
  name: 'AddRecipe',
  components: {
    RecipeForm
  }
}
</script>

<style>
/* Using Tailwind classes */
</style>