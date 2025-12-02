import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadGoogleMaps } from './utils/loadGoogleMaps'

// Load Google Maps API before rendering app
loadGoogleMaps()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((error) => {
    console.error('Failed to load Google Maps API:', error)
    // Still render the app even if Maps API fails to load
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
