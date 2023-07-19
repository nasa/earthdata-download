import React from 'react'
import PropTypes from 'prop-types'

import AppContextProvider from '../AppContextProvider/AppContextProvider'
import ElectronApiContextProvider from '../ElectronApiContextProvider/ElectronApiContextProvider'

/**
 * @typedef {Object} ProvidersProps
 * @property {ReactNode} children The children to be rendered.

/**
 * Renders any children wrapped with ElectronApiContextProvider and AppContextProvider.
 * @param {ProvidersProps} props
 *
 * @example <caption>Renders children wrapped with context providers.</caption>
 *
 * return (
 *   <Providers>
 *     {children}
 *   </Providers>
 * )
 */
const Providers = ({ children }) => (
  <ElectronApiContextProvider>
    <AppContextProvider>
      {children}
    </AppContextProvider>
  </ElectronApiContextProvider>
)

Providers.propTypes = {
  children: PropTypes.node.isRequired
}

export default Providers
