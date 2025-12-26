<template>
  <div id="app" class="font-sans antialiased text-center text-gray-700">
    <header class="bg-gray-100 p-4 mb-8">
      <h1 class="text-2xl font-bold mb-4">Hayley's Bitchin' Kitchen</h1>
      <nav class="flex flex-col sm:flex-row justify-center gap-4">
        <router-link to="/" class="text-green-600 font-bold hover:text-red-500">Home</router-link>
        <router-link to="/add-recipe" class="text-green-600 font-bold hover:text-red-500">Add Recipe</router-link>
      </nav>
    </header>
    <main class="max-w-7xl mx-auto px-4">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Remove scoped styles, using Tailwind classes */
</style>