import { createRouter, createWebHashHistory } from 'vue-router'
import OrderCreate from '../pages/OrderCreate.vue'
import CustomerCreate from '../pages/CustomerCreate.vue'
import SiteInfo from '../pages/SiteInfo.vue'
import MapEditor from '../pages/MapEditor.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'order', component: OrderCreate, meta: { step: 1 } },
    {
      path: '/customer',
      name: 'customer',
      component: CustomerCreate,
      meta: { step: 0 },
    },
    { path: '/site', name: 'site', component: SiteInfo, meta: { step: 2 } },
    { path: '/map', name: 'map', component: MapEditor, meta: { step: 3 } },
  ],
})

export default router
