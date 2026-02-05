<template>
  <div class="admin">
    <div class="container">
      <div v-if="!isAuthenticated">
        <AdminAuth @authenticated="handleAuthentication" />
      </div>
      
      <div v-else class="admin-panel">
        <div class="admin-header">
          <h1>Admin Panel</h1>
          <button @click="logout" class="secondary">Logout</button>
        </div>
        
        <div class="add-recipe-form">
          <h2>Add New Recipe</h2>
          
          <form @submit.prevent="addRecipe">
            <div class="form-group">
              <input
                v-model="newRecipeUrl"
                type="url"
                placeholder="https://example.com/recipe"
                required
                :disabled="submitting"
              />
            </div>
            
            <button type="submit" class="primary" :disabled="submitting">
              {{ submitting ? 'Adding...' : 'Add Recipe' }}
            </button>
          </form>
          
          <div v-if="submitting" class="spinner"></div>
          
          <div v-if="successMessage" class="success">
            {{ successMessage }}
            <router-link to="/">View Feed</router-link>
          </div>
          
          <div v-if="errorMessage" class="error">
            {{ errorMessage }}
          </div>
        </div>
        
        <div class="recent-recipes">
          <h2>Recent Posts</h2>
          
          <div v-if="loadingRecipes" class="spinner"></div>
          
          <div v-else-if="recipes.length === 0" class="empty">
            No recipes yet.
          </div>
          
          <div v-else class="recipe-list">
            <div v-for="recipe in recentRecipes" :key="recipe.id" class="recipe-item">
              <div class="recipe-info">
                <h3>{{ recipe.title }}</h3>
                <p class="url">{{ recipe.url }}</p>
                <p class="date">{{ formatDate(recipe.created_at) }}</p>
              </div>
              <button @click="deleteRecipe(recipe.id)" class="danger" :disabled="deleting === recipe.id">
                {{ deleting === recipe.id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminAuth from '../components/AdminAuth.vue';

export default {
  name: 'Admin',
  components: {
    AdminAuth
  },
  data() {
    return {
      isAuthenticated: false,
      token: null,
      newRecipeUrl: '',
      submitting: false,
      successMessage: '',
      errorMessage: '',
      recipes: [],
      loadingRecipes: false,
      deleting: null
    };
  },
  computed: {
    recentRecipes() {
      return this.recipes.slice(0, 10);
    }
  },
  mounted() {
    // Check for existing token
    const token = localStorage.getItem('adminToken');
    if (token) {
      this.token = token;
      this.isAuthenticated = true;
      this.fetchRecipes();
    }
  },
  methods: {
    handleAuthentication(token) {
      this.token = token;
      this.isAuthenticated = true;
      localStorage.setItem('adminToken', token);
      this.fetchRecipes();
    },
    
    logout() {
      this.isAuthenticated = false;
      this.token = null;
      localStorage.removeItem('adminToken');
    },
    
    async addRecipe() {
      try {
        this.submitting = true;
        this.successMessage = '';
        this.errorMessage = '';
        
        const response = await fetch('/api/admin/recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ url: this.newRecipeUrl })
        });
        
        if (response.status === 401) {
          this.logout();
          this.errorMessage = 'Session expired. Please login again.';
          return;
        }
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add recipe');
        }
        
        const recipe = await response.json();
        this.successMessage = `Recipe added: ${recipe.title}`;
        this.newRecipeUrl = '';
        
        // Refresh recipe list
        await this.fetchRecipes();
        
      } catch (err) {
        this.errorMessage = err.message;
      } finally {
        this.submitting = false;
      }
    },
    
    async fetchRecipes() {
      try {
        this.loadingRecipes = true;
        
        const response = await fetch('/api/recipes');
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        
        const data = await response.json();
        this.recipes = data.recipes;
        
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
      } finally {
        this.loadingRecipes = false;
      }
    },
    
    async deleteRecipe(id) {
      if (!confirm('Are you sure you want to delete this recipe?')) {
        return;
      }
      
      try {
        this.deleting = id;
        
        const response = await fetch(`/api/admin/recipes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
        
        if (response.status === 401) {
          this.logout();
          this.errorMessage = 'Session expired. Please login again.';
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to delete recipe');
        }
        
        // Remove from local list
        this.recipes = this.recipes.filter(r => r.id !== id);
        
      } catch (err) {
        this.errorMessage = err.message;
      } finally {
        this.deleting = null;
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.admin {
  min-height: 100vh;
  padding: 40px 0;
}

.admin-panel {
  max-width: 800px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.admin-header h1 {
  color: var(--primary);
}

.add-recipe-form {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
  margin-bottom: 40px;
}

.add-recipe-form h2 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.success a {
  color: #1e7e34;
  text-decoration: underline;
  margin-left: 8px;
}

.recent-recipes {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
}

.recent-recipes h2 {
  margin-bottom: 20px;
}

.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recipe-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--background);
  border-radius: 8px;
  gap: 16px;
}

.recipe-info {
  flex: 1;
  min-width: 0;
}

.recipe-info h3 {
  font-size: 1.1rem;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-info .url {
  font-size: 0.85rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.recipe-info .date {
  font-size: 0.8rem;
  color: #999;
}

.recipe-item button {
  flex-shrink: 0;
  padding: 8px 16px;
  font-size: 14px;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .recipe-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .recipe-item button {
    width: 100%;
  }
}
</style>
