<template>
  <div class="recipe-card border border-gray-300 rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
    <h3 class="mt-0 text-gray-800">{{ recipe.title }}</h3>
    <p class="date text-gray-600 text-sm mb-2">Created: {{ formatDate(recipe.created_at) }}</p>
    <p v-if="recipe.description" class="excerpt mb-2">{{ truncateText(recipe.description, 100) }}</p>
    <p v-if="recipe.link" class="link mb-2">Link: <a :href="recipe.link" target="_blank" class="text-green-600 no-underline hover:underline">View Recipe</a></p>
    <router-link :to="`/recipe/${recipe.id}`" class="view-more inline-block text-red-500 no-underline font-bold mt-2 hover:underline">View Full Recipe</router-link>
  </div>
</template>

<script>
export default {
  name: 'RecipeCard',
  props: {
    recipe: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style>
/* Using Tailwind classes */
</style>