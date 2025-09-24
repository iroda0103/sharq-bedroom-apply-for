import { createRouter, createWebHistory } from 'vue-router'
import AddApplication from '../views/AddApplication.vue'
import ShowAply from '../components/ShowAply.vue' 

const routes = [
    // { path: '/restaurant/:id', name: 'RestaurantMenu', component: RestaurantMenu }
    { path: '/', name: 'AddApplication', component: AddApplication },
    { path: '/:id', name: 'ShowAply', component: ShowAply },
    // { path: '/:catchAll(.*)', name: 'NotFound', component: NotFound }
]

export default createRouter({   
    history: createWebHistory(),
    routes
});