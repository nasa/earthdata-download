import React from 'react'
import PropTypes from 'prop-types'

import { ElectronApiContext } from '../../context/ElectronApiContext'

const { electronApi } = window

const ElectronApiProvider = ({ children }) => (
  <ElectronApiContext.Provider value={electronApi}>
    {children}
  </ElectronApiContext.Provider>
)

ElectronApiProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default ElectronApiProvider
