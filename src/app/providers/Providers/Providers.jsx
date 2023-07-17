import React from 'react'
import PropTypes from 'prop-types'

import AppContextProvider from '../AppContextProvider/AppContextProvider'
import ElectronApiContextProvider from '../ElectronApiContextProvider/ElectronApiContextProvider'

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
