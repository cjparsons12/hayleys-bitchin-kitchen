<template>
  <div class="recipe-card border border-slate-200 rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
    <div class="flex gap-4">
      <img v-if="recipe.image" :src="`/api/static/uploads/${recipe.image}`" :alt="recipe.title" class="w-24 h-24 object-cover rounded flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <h3 class="mt-0 text-slate-800 truncate">{{ recipe.title }}</h3>
        <p class="date text-slate-600 text-sm mb-2">Created: {{ formatDate(recipe.created_at) }}</p>
        <p v-if="recipe.description" class="excerpt mb-2">{{ truncateText(recipe.description, 100) }}</p>
        <p v-if="recipe.link" class="link mb-2">Link: <a :href="recipe.link" target="_blank" class="text-blue-600 no-underline hover:underline">View Recipe</a></p>
        <router-link :to="`/recipe/${recipe.id}`" class="view-more inline-block text-blue-700 no-underline font-semibold mt-2 hover:underline">View Full Recipe</router-link>
      </div>
    </div>
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