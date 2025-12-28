<template>
  <div class="recipe-list grid grid-cols-1 gap-4">
    <div v-if="recipes.length === 0" class="no-recipes col-span-full text-center py-8">
      <p>No recipes yet. <router-link to="/add-recipe" class="text-blue-600 no-underline hover:underline">Add one!</router-link></p>
    </div>
    <RecipeCard
      v-for="recipe in recipes"
      :key="recipe.id"
      :recipe="recipe"
    />
  </div>
</template>

<script>
import axios from 'axios'
import RecipeCard from './RecipeCard.vue'

export default {
  name: 'RecipeList',
  components: {
    RecipeCard
  },
  data() {
    return {
      recipes: []
    }
  },
  async mounted() {
    try {
      const response = await axios.get('/api/recipes')
      this.recipes = response.data
    } catch (error) {
      console.error('Error fetching recipes:', error)
    }
  }
}
</script>

<style>
/* Using Tailwind classes */
</style>