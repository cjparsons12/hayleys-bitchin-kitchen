<template>
  <div class="admin-auth">
    <div class="auth-card">
      <h2>Admin Login</h2>
      <p class="subtitle">Enter password to access admin panel</p>
      
      <form @submit.prevent="login">
        <div class="form-group">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            required
            :disabled="loading"
            autofocus
          />
        </div>
        
        <button type="submit" class="primary" :disabled="loading">
          {{ loading ? 'Authenticating...' : 'Login' }}
        </button>
      </form>
      
      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminAuth',
  emits: ['authenticated'],
  data() {
    return {
      password: '',
      loading: false,
      error: null
    };
  },
  methods: {
    async login() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password: this.password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }
        
        this.$emit('authenticated', data.token);
        
      } catch (err) {
        this.error = err.message;
        this.password = '';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.admin-auth {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.auth-card {
  background: var(--card-bg);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 16px var(--shadow);
  max-width: 400px;
  width: 100%;
}

.auth-card h2 {
  color: var(--primary);
  margin-bottom: 8px;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

button[type="submit"] {
  width: 100%;
}
</style>
