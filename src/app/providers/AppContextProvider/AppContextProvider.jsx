import React from 'react'
import PropTypes from 'prop-types'

import useToasts from '../../hooks/useToasts'

import AppContext from '../../context/AppContext'

const AppContextProvider = ({ children }) => {
  const toastContext = useToasts()

  return (
    <AppContext.Provider value={toastContext}>
      {children}
    </AppContext.Provider>
  )
}

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default AppContextProvider
