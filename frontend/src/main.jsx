import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider} from '@chakra-ui/react'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import theme from './theme.js'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

window.__appReady = true
if (window.__appSplashTimer) {
  clearTimeout(window.__appSplashTimer)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme = {theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
)

if (window.__hideAppSplash) {
  requestAnimationFrame(() => {
    window.__hideAppSplash()
  })
}