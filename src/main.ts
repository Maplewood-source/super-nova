import { createApp } from 'vue'
import App from './App.vue'
import './samples/node-api'

const app = createApp(App)

app.mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
