import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initStudioTheme } from './context/StudioThemeContext'
import './index.css'
import App from './App.tsx'

initStudioTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
