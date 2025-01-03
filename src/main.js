import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";

import ListeCarteTaxonWidget from "./components/ListeCarteTaxonWidget.vue";
import ListeTaxonWidget from "./components/ListeTaxonWidget.vue";
import MainPage from "./components/MainPage.vue";

import {
  createMemoryHistory,
  createWebHistory,
  createRouter,
} from "vue-router";

const routes = [
  {
    path: "/",
    component: ListeCarteTaxonWidget,
  },
  {
    path: "/taxons",
    component: ListeTaxonWidget,
  },
  {
    path: "/configurateur",
    component: MainPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(router).mount("#app");
