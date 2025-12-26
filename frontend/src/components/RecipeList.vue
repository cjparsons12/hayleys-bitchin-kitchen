<template>
  <div class="recipe-list">
    <div v-if="recipes.length === 0" class="no-recipes">
      <p>No recipes yet. <router-link to="/add-recipe">Add one!</router-link></p>
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

<style scoped>
.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.no-recipes {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
}

.no-recipes a {
  color: #42b883;
  text-decoration: none;
}

.no-recipes a:hover {
  text-decoration: underline;
}
</style>