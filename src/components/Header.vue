<template>
  <header class="header">
    <div class="container">
      <router-link to="/" class="logo">
        <h1>🍳 Hayley's Bitchin Kitchen</h1>
      </router-link>
      <nav>
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/admin" class="nav-link">Admin</router-link>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header'
};
</script>

<style scoped>
.header {
  background: white;
  box-shadow: 0 2px 8px var(--shadow);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  color: var(--primary);
}

.logo h1 {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  text-decoration: none;
  color: var(--text);
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: var(--background);
  color: var(--primary);
}

.nav-link.router-link-active {
  color: var(--primary);
  background: var(--background);
}

@media (max-width: 768px) {
  .logo h1 {
    font-size: 1.2rem;
  }
  
  nav {
    gap: 12px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}
</style>
