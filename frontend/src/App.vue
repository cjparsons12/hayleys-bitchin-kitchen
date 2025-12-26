<template>
  <div id="app">
    <header>
      <h1>Hayley's Bitchin' Kitchen</h1>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/add-recipe">Add Recipe</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

header {
  background-color: #f8f9fa;
  padding: 1rem;
  margin-bottom: 2rem;
}

nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

nav a {
  text-decoration: none;
  color: #42b883;
  font-weight: bold;
}

nav a.router-link-active {
  color: #ff6b6b;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>