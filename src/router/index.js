import { createRouter, createWebHistory } from 'vue-router'
import AddApplication from '../views/AddApplication.vue'
import ShowAply from '../components/ShowAply.vue' 
import ApplyList from '../components/ApplyList.vue'

const routes = [
    // { path: '/restaurant/:id', name: 'RestaurantMenu', component: RestaurantMenu }
    { path: '/apply', name: 'AddApplication', component: AddApplication },
    { path: '/', name: 'ShowAply', component: ShowAply },
    // { path: '/natija', name: 'ShowAply', component: ShowAply },
    { path: '/list', name: 'ApplyList', component: ApplyList },
    // { path: '/:catchAll(.*)', name: 'NotFound', component: NotFound }
]

export default createRouter({   
    history: createWebHistory(),
    routes
});