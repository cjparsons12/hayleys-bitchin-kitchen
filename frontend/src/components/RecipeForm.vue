<template>
  <form @submit.prevent="submitRecipe" class="recipe-form">
    <div class="form-group">
      <label for="title">Title *</label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        required
        placeholder="Recipe title"
      />
    </div>
    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        placeholder="Full recipe details (optional)"
        rows="5"
      ></textarea>
    </div>
    <div class="form-group">
      <label for="link">Link</label>
      <input
        id="link"
        v-model="form.link"
        type="url"
        placeholder="URL to external recipe (optional)"
      />
    </div>
    <button type="submit" :disabled="loading" class="submit-btn">
      {{ loading ? 'Adding...' : 'Add Recipe' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">Recipe added successfully!</p>
  </form>
</template>

<script>
import axios from 'axios'

export default {
  name: 'RecipeForm',
  data() {
    return {
      form: {
        title: '',
        description: '',
        link: ''
      },
      loading: false,
      error: null,
      success: false
    }
  },
  methods: {
    async submitRecipe() {
      if (!this.form.title.trim()) return

      this.loading = true
      this.error = null
      this.success = false

      try {
        await axios.post('/api/recipes', this.form)
        this.success = true
        this.form = { title: '', description: '', link: '' }
        // Optionally emit event to refresh list
        this.$emit('recipe-added')
      } catch (error) {
        this.error = 'Failed to add recipe. Please try again.'
        console.error('Error adding recipe:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.recipe-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input, textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

textarea {
  resize: vertical;
}

.submit-btn {
  padding: 0.75rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #369870;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  font-weight: bold;
}

.success {
  color: #27ae60;
  font-weight: bold;
}
</style>