<template>
  <div class="home">
    <h2>Latest Recipes</h2>
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

<style scoped>
.home {
  text-align: left;
}

h2 {
  margin-bottom: 1rem;
}
</style>