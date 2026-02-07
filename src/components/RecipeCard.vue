<template>
  <div class="recipe-card" @click="openRecipe">
    <div class="recipe-image">
      <img :src="recipe.image_url" :alt="recipe.title" @error="handleImageError" />
    </div>
    <div class="recipe-content">
      <h3 class="recipe-title">{{ recipe.title }}</h3>
      <p class="recipe-description">{{ truncatedDescription }}</p>
      <div class="recipe-meta">
        <span class="site-name">{{ recipe.site_name }}</span>
        <span class="date">{{ formatDate(recipe.created_at) }}</span>
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
  computed: {
    truncatedDescription() {
      if (!this.recipe.description) return '';
      return this.recipe.description.length > 150 
        ? this.recipe.description.substring(0, 150) + '...'
        : this.recipe.description;
    }
  },
  methods: {
    openRecipe() {
      this.$router.push(`/recipe/${this.recipe.slug}`);
    },
    
    handleImageError(event) {
      event.target.src = 'https://placehold.co/400x300/FF6B6B/FFFFFF?text=Recipe&font=quicksand';
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }
};
</script>

<style scoped>
.recipe-card {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px var(--shadow);
}

.recipe-image {
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: #f0f0f0;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-card:hover .recipe-image img {
  transform: scale(1.05);
}

.recipe-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recipe-title {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: var(--text);
  line-height: 1.4;
}

.recipe-description {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 16px;
  flex: 1;
  line-height: 1.5;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  font-size: 0.85rem;
}

.site-name {
  color: var(--primary);
  font-weight: 600;
}

.date {
  color: #999;
}

@media (max-width: 768px) {
  .recipe-image {
    height: 200px;
  }
  
  .recipe-title {
    font-size: 1.1rem;
  }
}
</style>
