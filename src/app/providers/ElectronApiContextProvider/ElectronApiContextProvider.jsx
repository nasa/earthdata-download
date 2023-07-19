import React from 'react'
import PropTypes from 'prop-types'

import { ElectronApiContext } from '../../context/ElectronApiContext'

const { electronApi } = window

/**
 * @typedef {Object} ElectronApiContextProviderProps
 * @property {ReactNode} children The children to be rendered.

/**
 * Renders any children wrapped with ElectronApiContext.
 * @param {ElectronApiContextProviderProps} props
 *
 * @example <caption>Renders children wrapped with ElectronApiContext.</caption>
 *
 * return (
 *   <ElectronApiContextProvider>
 *     {children}
 *   </ElectronApiContextProvider>
 * )
 */
const ElectronApiContextProvider = ({ children }) => (
  <ElectronApiContext.Provider value={electronApi}>
    {children}
  </ElectronApiContext.Provider>
)

ElectronApiContextProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default ElectronApiContextProvider
