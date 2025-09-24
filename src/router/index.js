import { createRouter, createWebHistory } from 'vue-router'
import AddApplication from '../views/AddApplication.vue'

const routes = [
    // { path: '/restaurant/:id', name: 'RestaurantMenu', component: RestaurantMenu }
    { path: '/', name: 'AddApplication', component: AddApplication },
    { path: '/:id', name: 'AddApplication', component: AddApplication },
    // { path: '/:catchAll(.*)', name: 'NotFound', component: NotFound }
]

export default createRouter({   
    history: createWebHistory(),
    routes
});