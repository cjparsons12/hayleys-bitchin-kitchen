<template>
  <div class="home text-left">
    <h2 class="mb-4">Latest Recipes</h2>
    <RecipeList />
  </div>
</template>

<script>
import RecipeList from '../components/RecipeList.vue'

export default {
  name: 'Home',
  components: {
    RecipeList
  }
}
</script>

<style>
/* Using Tailwind classes */
</style>