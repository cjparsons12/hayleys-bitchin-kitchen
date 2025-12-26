<template>
  <div class="add-recipe">
    <h2>Add a New Recipe</h2>
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

<style scoped>
.add-recipe {
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 1rem;
}
</style>