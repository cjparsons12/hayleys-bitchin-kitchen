<template>
  <div class="recipe-detail text-left max-w-3xl mx-auto" v-if="recipe">
    <div class="flex flex-col md:flex-row gap-6 mb-6" v-if="recipe.image">
      <img :src="`/api/static/uploads/${recipe.image}`" :alt="recipe.title" class="w-full md:w-1/2 h-64 md:h-96 object-cover rounded-lg" />
      <div class="flex-1">
        <h2 class="mb-2">{{ recipe.title }}</h2>
        <p class="date text-slate-600 text-sm">Created: {{ formatDate(recipe.created_at) }}</p>
      </div>
    </div>
    <div v-else>
      <h2 class="mb-2">{{ recipe.title }}</h2>
      <p class="date text-slate-600 text-sm">Created: {{ formatDate(recipe.created_at) }}</p>
    </div>
    <div v-if="recipe.description" class="description mt-8">
      <h3>Description</h3>
      <p>{{ recipe.description }}</p>
    </div>
    <div v-if="recipe.additional_images && recipe.additional_images.length > 0" class="additional-images mt-8">
      <h3>Additional Images</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <img 
          v-for="image in recipe.additional_images" 
          :key="image.id"
          :src="`/api/static/uploads/${image.image_filename}`" 
          :alt="`Additional image for ${recipe.title}`" 
          class="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
          @click="openImageModal(`/api/static/uploads/${image.image_filename}`)"
        />
      </div>
    </div>
    <div v-if="recipe.link" class="link mt-8">
      <h3>Link</h3>
      <a :href="recipe.link" target="_blank" class="text-blue-600 no-underline hover:underline">{{ recipe.link }}</a>
    </div>
  </div>
  
  <!-- Image Modal -->
  <div v-if="modalImage" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" @click="closeImageModal">
    <div class="max-w-4xl max-h-full p-4">
      <img :src="modalImage" alt="Full size image" class="max-w-full max-h-full object-contain" />
      <button @click="closeImageModal" class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300">&times;</button>
    </div>
  </div>
  <div v-else class="text-center">
    <p>Loading recipe...</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'RecipeDetail',
  props: ['id'],
  data() {
    return {
      recipe: null,
      modalImage: null
    }
  },
  async mounted() {
    try {
      const response = await axios.get(`/api/recipes/${this.id}`)
      this.recipe = response.data
    } catch (error) {
      console.error('Error fetching recipe:', error)
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    openImageModal(imageSrc) {
      this.modalImage = imageSrc
    },
    closeImageModal() {
      this.modalImage = null
    }
  }
}
</script>

<style>
/* Using Tailwind classes */
</style>