<template>
  <div class="recipe-detail" v-if="recipe">
    <h2>{{ recipe.title }}</h2>
    <p class="date">Created: {{ formatDate(recipe.created_at) }}</p>
    <div v-if="recipe.description" class="description">
      <h3>Description</h3>
      <p>{{ recipe.description }}</p>
    </div>
    <div v-if="recipe.link" class="link">
      <h3>Link</h3>
      <a :href="recipe.link" target="_blank">{{ recipe.link }}</a>
    </div>
  </div>
  <div v-else>
    <p>Loading recipe...</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'RecipeDetail',
  props: ['id'],
  data() {
    return {
      recipe: null
    }
  },
  async mounted() {
    try {
      const response = await axios.get(`/api/recipes/${this.id}`)
      this.recipe = response.data
    } catch (error) {
      console.error('Error fetching recipe:', error)
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.recipe-detail {
  text-align: left;
  max-width: 800px;
  margin: 0 auto;
}

.date {
  color: #666;
  font-size: 0.9rem;
}

.description, .link {
  margin-top: 2rem;
}

.link a {
  color: #42b883;
  text-decoration: none;
}

.link a:hover {
  text-decoration: underline;
}
</style>