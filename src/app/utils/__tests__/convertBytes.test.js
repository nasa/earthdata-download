import convertBytes from '../convertBytes'

describe('convertBytes with different sizes', () => {
  test('gigabyte sized files render correctly', async () => {
    const humanizedBytes = convertBytes(56491438421)
    expect(humanizedBytes).toEqual('53 gb')
  })

  test('megabyte sized files render correctly', async () => {
    const humanizedBytes = convertBytes(17563648)
    expect(humanizedBytes).toEqual('17 mb')
  })

  test('kilobyte sized files render correctly', async () => {
    const humanizedBytes = convertBytes(2024)
    expect(humanizedBytes).toEqual('2 kb')
  })

  test('byte < 1024 sized files render correctly', async () => {
    const humanizedBytes = convertBytes(567)
    expect(humanizedBytes).toEqual('567 b')
  })

  test('null case return 0 bytes being processed', async () => {
    const humanizedBytes = convertBytes(null)
    expect(humanizedBytes).toEqual('0 b')
  })
})
