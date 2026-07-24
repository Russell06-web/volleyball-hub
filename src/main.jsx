import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { runStorageMigrations } from './services/storageMigration.js'
import './styles/style.css'

// Must run before any Context reads localStorage, so old-shape data
// (registered instead of registeredCount, Chinese-label type/level/etc)
// is converted once, up front, rather than each Context guessing at
// runtime.
runStorageMigrations()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
