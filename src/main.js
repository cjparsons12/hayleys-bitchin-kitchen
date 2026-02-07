import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Home from './views/Home.vue';
import Admin from './views/Admin.vue';
import RecipeDetail from './views/RecipeDetail.vue';
import './style.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/admin', component: Admin },
    { path: '/recipe/:slug', component: RecipeDetail }
  ]
});

const app = createApp(App);
app.use(router);
app.mount('#app');
