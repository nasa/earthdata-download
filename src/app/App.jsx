import React from 'react'

import Layout from './components/Layout/Layout'

import Providers from './providers/Providers/Providers'

import 'inter-ui/inter.css'

import './App.scss'

/**
 * Renders the Application
 *
 * @example
 * return (
 *   <App />
 * )
 */
const App = () => (
  <Providers>
    <Layout />
  </Providers>
)

export default App
