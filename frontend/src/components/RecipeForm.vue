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
      <label for="additionalImages" class="font-bold mb-2">Additional Images (Optional)</label>
      <input
        id="additionalImages"
        ref="additionalImagesInput"
        type="file"
        accept="image/*"
        multiple
        @change="handleAdditionalImagesChange"
        class="p-2 border border-slate-300 rounded font-inherit focus:border-blue-500 focus:outline-none"
      />
      <div v-if="additionalImagesPreviews.length > 0" class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
        <div v-for="(preview, index) in additionalImagesPreviews" :key="index" class="relative">
          <img :src="preview" alt="Additional image preview" class="w-full h-24 object-cover rounded" />
          <button type="button" @click="removeAdditionalImage(index)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600">×</button>
        </div>
      </div>
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
      additionalImagesFiles: [],
      additionalImagesPreviews: [],
      loading: false,
      error: null,
      success: false
    }
  },
  methods: {
    handleAdditionalImagesChange(event) {
      const files = Array.from(event.target.files)
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          this.additionalImagesFiles.push(file)
          const reader = new FileReader()
          reader.onload = (e) => {
            this.additionalImagesPreviews.push(e.target.result)
          }
          reader.readAsDataURL(file)
        }
      })
    },
    removeAdditionalImage(index) {
      this.additionalImagesFiles.splice(index, 1)
      this.additionalImagesPreviews.splice(index, 1)
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
        
        const response = await axios.post('/api/recipes', recipeData)
        this.success = true
        
        // Upload additional images if any
        if (this.additionalImagesFiles.length > 0) {
          for (const imageFile of this.additionalImagesFiles) {
            const formData = new FormData()
            formData.append('file', imageFile)
            await axios.post(`/api/recipes/${response.data.id}/images`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })
          }
        }
        
        this.form = { title: '', description: '', link: '', image: '' }
        this.selectedFile = null
        this.imagePreview = null
        this.additionalImagesFiles = []
        this.additionalImagesPreviews = []
        this.$refs.imageInput.value = ''
        if (this.$refs.additionalImagesInput) {
          this.$refs.additionalImagesInput.value = ''
        }
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