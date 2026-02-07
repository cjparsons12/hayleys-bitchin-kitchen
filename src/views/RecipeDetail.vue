<template>
  <div class="recipe-detail">
    <div v-if="loading" class="spinner-container">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="container">
        <div class="error-content">
          <h2>Recipe Not Found</h2>
          <p>{{ error }}</p>
          <button @click="goHome" class="btn-home">Back to Home</button>
        </div>
      </div>
    </div>
    
    <div v-else-if="recipe" class="recipe-content">
      <div class="recipe-hero">
        <img :src="recipe.image_url" :alt="recipe.title" @error="handleImageError" />
        <div class="hero-overlay">
          <div class="container">
            <h1 class="recipe-title">{{ recipe.title }}</h1>
          </div>
        </div>
      </div>
      
      <div class="container">
        <div class="recipe-info">
          <div class="recipe-meta">
            <span class="site-badge">{{ recipe.site_name }}</span>
            <span class="date">{{ formatDate(recipe.created_at) }}</span>
          </div>
          
          <p v-if="recipe.description" class="recipe-description">
            {{ recipe.description }}
          </p>
          
          <div class="action-section">
            <a 
              :href="recipe.url" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-view-recipe"
            >
              View Full Recipe
              <svg class="external-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
            <button @click="goHome" class="btn-secondary">Back to All Recipes</button>
          </div>
          
          <div class="permalink-section">
            <label>Share this recipe:</label>
            <div class="permalink-input">
              <input 
                type="text" 
                :value="permalinkUrl" 
                readonly
                @click="selectPermalink"
                ref="permalinkInput"
              />
              <button @click="copyPermalink" class="btn-copy">
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecipeDetail',
  data() {
    return {
      recipe: null,
      loading: true,
      error: null,
      copied: false
    };
  },
  computed: {
    permalinkUrl() {
      return window.location.href;
    }
  },
  async mounted() {
    await this.fetchRecipe();
  },
  methods: {
    async fetchRecipe() {
      try {
        this.loading = true;
        this.error = null;
        
        const slug = this.$route.params.slug;
        const response = await fetch(`/api/recipes/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('This recipe could not be found.');
          }
          throw new Error('Failed to load recipe.');
        }
        
        const data = await response.json();
        this.recipe = data.recipe;
        
        // Update page title for SEO
        if (this.recipe.title) {
          document.title = `${this.recipe.title} - Hayley's Bitchin Kitchen`;
        }
        
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    
    handleImageError(event) {
      event.target.src = 'https://placehold.co/800x600/FF6B6B/FFFFFF?text=Recipe&font=quicksand';
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    },
    
    goHome() {
      this.$router.push('/');
    },
    
    selectPermalink() {
      this.$refs.permalinkInput.select();
    },
    
    async copyPermalink() {
      try {
        await navigator.clipboard.writeText(this.permalinkUrl);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        this.$refs.permalinkInput.select();
        document.execCommand('copy');
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      }
    }
  }
};
</script>

<style scoped>
.recipe-detail {
  min-height: 100vh;
  background: var(--bg);
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.error-container {
  padding: 80px 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.error-content h2 {
  color: var(--primary);
  margin-bottom: 16px;
}

.error-content p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.btn-home {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-home:hover {
  background: var(--secondary);
  transform: translateY(-2px);
}

.recipe-hero {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 400px;
  max-height: 600px;
  overflow: hidden;
}

.recipe-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);
  padding: 40px 0 30px;
}

.recipe-title {
  color: white;
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.recipe-info {
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.recipe-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.site-badge {
  background: var(--primary);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.date {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.recipe-description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text);
  margin-bottom: 32px;
}

.action-section {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.btn-view-recipe {
  background: var(--primary);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-view-recipe:hover {
  background: var(--secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.external-icon {
  width: 20px;
  height: 20px;
}

.btn-secondary {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--primary);
  color: white;
}

.permalink-section {
  background: var(--card-bg);
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.permalink-section label {
  display: block;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}

.permalink-input {
  display: flex;
  gap: 8px;
}

.permalink-input input {
  flex: 1;
  padding: 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
  color: var(--text);
}

.permalink-input input:focus {
  outline: none;
  border-color: var(--primary);
}

.btn-copy {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-copy:hover {
  background: var(--secondary);
}

/* Responsive styles */
@media (max-width: 768px) {
  .recipe-title {
    font-size: 1.75rem;
  }
  
  .recipe-hero {
    height: 50vh;
    min-height: 300px;
  }
  
  .recipe-info {
    padding: 24px 16px;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .btn-view-recipe,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .permalink-input {
    flex-direction: column;
  }
  
  .btn-copy {
    width: 100%;
  }
}
</style>
