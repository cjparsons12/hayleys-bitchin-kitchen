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
        class="p-2 border border-slate-300 rounded font-inherit focus:border-blue-500 focus:outline-none"
      />
    </div>
    <div class="form-group flex flex-col text-left">
      <label for="image" class="font-bold mb-2">Recipe Image *</label>
      <input
        id="image"
        ref="imageInput"
        type="file"
        accept="image/*"
        required
        @change="handleImageChange"
        class="p-2 border border-slate-300 rounded font-inherit focus:border-blue-500 focus:outline-none"
      />
      <div v-if="imagePreview" class="mt-2">
        <img :src="imagePreview" alt="Recipe preview" class="max-w-full h-48 object-cover rounded" />
      </div>
    </div>
    <div class="form-group flex flex-col text-left">
      <label for="description" class="font-bold mb-2">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        placeholder="Full recipe details (optional)"
        rows="5"
        class="p-2 border border-slate-300 rounded font-inherit resize-y focus:border-blue-500 focus:outline-none"
      ></textarea>
    </div>
    <div class="form-group flex flex-col text-left">
      <label for="link" class="font-bold mb-2">Link</label>
      <input
        id="link"
        v-model="form.link"
        type="url"
        placeholder="URL to external recipe (optional)"
        class="p-2 border border-slate-300 rounded font-inherit focus:border-blue-500 focus:outline-none"
      />
    </div>
    <button type="submit" :disabled="loading" class="submit-btn py-3 bg-blue-600 text-white border-none rounded cursor-pointer text-lg transition-colors hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
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
        link: '',
        image: ''
      },
      selectedFile: null,
      imagePreview: null,
      loading: false,
      error: null,
      success: false
    }
  },
  methods: {
    handleImageChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedFile = file
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    async submitRecipe() {
      if (!this.form.title.trim() || !this.selectedFile) return

      this.loading = true
      this.error = null
      this.success = false

      try {
        // First upload the image
        const formData = new FormData()
        formData.append('file', this.selectedFile)
        const uploadResponse = await axios.post('/api/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        // Then create the recipe with the image filename
        const recipeData = {
          ...this.form,
          image: uploadResponse.data.filename
        }
        
        await axios.post('/api/recipes', recipeData)
        this.success = true
        this.form = { title: '', description: '', link: '', image: '' }
        this.selectedFile = null
        this.imagePreview = null
        this.$refs.imageInput.value = ''
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