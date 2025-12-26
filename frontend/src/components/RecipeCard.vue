<template>
  <div class="recipe-card">
    <h3>{{ recipe.title }}</h3>
    <p class="date">Created: {{ formatDate(recipe.created_at) }}</p>
    <p v-if="recipe.description" class="excerpt">{{ truncateText(recipe.description, 100) }}</p>
    <p v-if="recipe.link" class="link">Link: <a :href="recipe.link" target="_blank">View Recipe</a></p>
    <router-link :to="`/recipe/${recipe.id}`" class="view-more">View Full Recipe</router-link>
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

<style scoped>
.recipe-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s;
}

.recipe-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

h3 {
  margin-top: 0;
  color: #2c3e50;
}

.date {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.excerpt {
  margin-bottom: 0.5rem;
}

.link {
  margin-bottom: 0.5rem;
}

.link a {
  color: #42b883;
  text-decoration: none;
}

.link a:hover {
  text-decoration: underline;
}

.view-more {
  display: inline-block;
  color: #ff6b6b;
  text-decoration: none;
  font-weight: bold;
  margin-top: 0.5rem;
}

.view-more:hover {
  text-decoration: underline;
}
</style>