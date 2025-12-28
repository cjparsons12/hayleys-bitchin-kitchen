<template>
  <div id="app" class="font-sans antialiased text-center text-slate-700 bg-slate-50 min-h-screen">
    <header class="bg-slate-100 p-4 mb-8 shadow-sm relative overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-10" style="background-image: url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');"></div>
      <div class="relative z-10">
        <div class="flex items-center justify-center mb-4">
          <svg class="w-12 h-12 mr-3 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V8H20V10H18V11C18 12.1 17.1 13 16 13H14V14C14 15.1 13.1 16 12 16C10.9 16 10 15.1 10 14V13H8C6.9 13 6 12.1 6 11V10H4V8H6V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2M12 4C11.4 4 11 4.4 11 5V6H13V5C13 4.4 12.6 4 12 4M8 7V8H16V7H8M8 10V11H16V10H8M12 14C12.6 14 13 13.6 13 13V12H11V13C11 13.6 11.4 14 12 14Z"/>
          </svg>
          <h1 class="text-3xl font-bold text-slate-800">Hayley's Bitchin' Kitchen</h1>
        </div>
        <nav class="flex flex-col sm:flex-row justify-center gap-4">
          <router-link to="/" class="text-blue-600 font-semibold hover:text-blue-800 transition-colors">Home</router-link>
          <router-link to="/add-recipe" class="text-blue-600 font-semibold hover:text-blue-800 transition-colors">Add Recipe</router-link>
        </nav>
      </div>
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