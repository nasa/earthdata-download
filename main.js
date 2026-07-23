import './style.scss'

import { setOSClassName } from './js/util/setOSClassName'
import { setVersionNumber } from './js/util/setVersionNumber'

setOSClassName(document.body)
setVersionNumber(document.getElementById('versionNumber'))
