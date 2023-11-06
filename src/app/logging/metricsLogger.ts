import axios from 'axios'

const metricsLogger = async (event: any) => {
  try {
    const response = await axios.post('https://dycghwhsgr9el.cloudfront.net/edd_logger', { params: event })

    console.log(response)
  } catch (error) {
    console.error(error)
  }
}

export default metricsLogger
