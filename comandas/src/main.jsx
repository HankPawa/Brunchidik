import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fuentes servidas desde el propio proyecto: el salón funciona en red local
// y la app de escritorio, así que no pueden depender de Google Fonts.
import '@fontsource-variable/archivo'
import '@fontsource/young-serif/latin-400.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
