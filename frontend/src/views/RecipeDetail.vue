<template>
  <div class="recipe-detail text-left max-w-3xl mx-auto" v-if="recipe">
    <div class="flex flex-col md:flex-row gap-6 mb-6" v-if="recipe.image">
      <img :src="`/api/static/uploads/${recipe.image}`" :alt="recipe.title" class="w-full md:w-1/2 h-64 md:h-96 object-cover rounded-lg" />
      <div class="flex-1">
        <h2 class="mb-2">{{ recipe.title }}</h2>
        <p class="date text-slate-600 text-sm">Created: {{ formatDate(recipe.created_at) }}</p>
      </div>
    </div>
    <div v-else>
      <h2 class="mb-2">{{ recipe.title }}</h2>
      <p class="date text-slate-600 text-sm">Created: {{ formatDate(recipe.created_at) }}</p>
    </div>
    <div v-if="recipe.description" class="description mt-8">
      <h3>Description</h3>
      <p>{{ recipe.description }}</p>
    </div>
    <div v-if="recipe.link" class="link mt-8">
      <h3>Link</h3>
      <a :href="recipe.link" target="_blank" class="text-blue-600 no-underline hover:underline">{{ recipe.link }}</a>
    </div>
  </div>
  <div v-else class="text-center">
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

<style>
/* Using Tailwind classes */
</style>