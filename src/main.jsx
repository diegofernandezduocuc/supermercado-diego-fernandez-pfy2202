import React from 'react'
import {createRoot} from 'react-dom/client'
import {HashRouter} from 'react-router-dom'
import {InventoryProvider} from './context/InventoryContext'
import App from './App'
import './styles.css'
createRoot(document.getElementById('root')).render(<React.StrictMode><HashRouter><InventoryProvider><App/></InventoryProvider></HashRouter></React.StrictMode>)
