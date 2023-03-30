import { createApp } from 'vue'
import naive from 'naive-ui'
import "./style.css"
import App from './App.vue'
import './samples/node-api'

const app = createApp(App)

app.mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })

app.use(naive)
