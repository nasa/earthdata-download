import React from 'react'

import Layout from './components/Layout/Layout'

import { ElectronApiContext } from './context/ElectronApiContext'

import 'simplebar-react/dist/simplebar.min.css'
import 'inter-ui/inter.css'

import './App.scss'

const { electronApi } = window

/**
 * Renders the Application
 *
 * @example
 * return (
 *   <App />
 * )
 */
const App = () => (
  <ElectronApiContext.Provider value={electronApi}>
    <Layout />
  </ElectronApiContext.Provider>
)

export default App
