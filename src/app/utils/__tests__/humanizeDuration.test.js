import hd from 'humanize-duration'
import humanizeDuration from '../humanizeDuration'

jest.mock('humanize-duration', () => ({
  // eslint-disable-next-line react/prop-types
  __esModule: true,
  default: jest.fn()
}))

describe('humanizeDuration', () => {
  test('should call humanizeDuration with the correct options ', () => {
    humanizeDuration(1234)
    expect(hd).toHaveBeenCalledTimes(1)
    expect(hd).toHaveBeenCalledWith(
      1234,
      expect.objectContaining({
        largest: 2,
        round: 1,
        language: 'shortEn',
        languages: {
          shortEn: expect.objectContaining({
            y: expect.any(Function),
            mo: expect.any(Function),
            w: expect.any(Function),
            d: expect.any(Function),
            h: expect.any(Function),
            m: expect.any(Function),
            s: expect.any(Function),
            ms: expect.any(Function)
          })
        },
        serialComma: false,
        spacer: ''
      })
    )
  })

  test('the functions that define the custom shortEn language return the correct values', () => {
    humanizeDuration(1234)

    const shortEnConfig = hd.mock.calls[0][1].languages.shortEn

    expect(shortEnConfig.y()).toEqual('y')
    expect(shortEnConfig.mo()).toEqual('mo')
    expect(shortEnConfig.w()).toEqual('w')
    expect(shortEnConfig.d()).toEqual('d')
    expect(shortEnConfig.h()).toEqual('h')
    expect(shortEnConfig.m()).toEqual('m')
    expect(shortEnConfig.s()).toEqual('s')
    expect(shortEnConfig.ms()).toEqual('ms')
  })
})
