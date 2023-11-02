// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios'

const metricsLogger = async (event: any) => {
  try {
    const response = await axios.post('http://localhost:3001/dev/edd_logger', { params: event })

    console.log(response)
  } catch (error) {
    console.error(error)
  }
}

export default metricsLogger
