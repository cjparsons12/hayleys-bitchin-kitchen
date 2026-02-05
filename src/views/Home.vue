<template>
  <div class="home">
    <div class="hero">
      <div class="container">
        <h1>Hayley's Bitchin Kitchen</h1>
        <p class="tagline">Recipes worth sharing</p>
      </div>
    </div>
    
    <div class="container">
      <div v-if="loading" class="spinner"></div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      
      <div v-else-if="recipes.length === 0" class="empty-state">
        <h2>No recipes yet!</h2>
        <p>Check back soon for delicious recipes.</p>
      </div>
      
      <div v-else class="recipe-grid">
        <RecipeCard 
          v-for="recipe in recipes" 
          :key="recipe.id" 
          :recipe="recipe" 
        />
      </div>
    </div>
  </div>
</template>

<script>
import RecipeCard from '../components/RecipeCard.vue';

export default {
  name: 'Home',
  components: {
    RecipeCard
  },
  data() {
    return {
      recipes: [],
      loading: true,
      error: null
    };
  },
  async mounted() {
    await this.fetchRecipes();
  },
  methods: {
    async fetchRecipes() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await fetch('/api/recipes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        
        const data = await response.json();
        this.recipes = data.recipes;
        
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding-bottom: 60px;
}

.hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  padding: 60px 0;
  text-align: center;
  margin-bottom: 40px;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 8px;
}

.tagline {
  font-size: 1.25rem;
  opacity: 0.95;
  font-style: italic;
}

.recipe-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 20px 0;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state h2 {
  color: var(--primary);
  margin-bottom: 12px;
}

/* Responsive grid */
@media (min-width: 768px) {
  .recipe-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .hero h1 {
    font-size: 3.5rem;
  }
}

@media (min-width: 1024px) {
  .recipe-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .hero h1 {
    font-size: 4rem;
  }
}
</style>
