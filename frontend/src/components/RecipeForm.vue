<template>
  <form @submit.prevent="submitRecipe" class="recipe-form flex flex-col gap-4">
    <div class="form-group flex flex-col text-left">
      <label for="title" class="font-bold mb-2">Title *</label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        required
        placeholder="Recipe title"
        class="p-2 border border-gray-300 rounded font-inherit"
      />
    </div>
    <div class="form-group flex flex-col text-left">
      <label for="description" class="font-bold mb-2">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        placeholder="Full recipe details (optional)"
        rows="5"
        class="p-2 border border-gray-300 rounded font-inherit resize-y"
      ></textarea>
    </div>
    <div class="form-group flex flex-col text-left">
      <label for="link" class="font-bold mb-2">Link</label>
      <input
        id="link"
        v-model="form.link"
        type="url"
        placeholder="URL to external recipe (optional)"
        class="p-2 border border-gray-300 rounded font-inherit"
      />
    </div>
    <button type="submit" :disabled="loading" class="submit-btn py-3 bg-green-600 text-white border-none rounded cursor-pointer text-lg transition-colors hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
      {{ loading ? 'Adding...' : 'Add Recipe' }}
    </button>
    <p v-if="error" class="error text-red-500 font-bold">{{ error }}</p>
    <p v-if="success" class="success text-green-600 font-bold">Recipe added successfully!</p>
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

<style>
/* Using Tailwind classes */
</style>