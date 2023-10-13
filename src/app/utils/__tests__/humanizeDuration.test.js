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
        language: 'abbreviatedEnglish',
        languages: {
          abbreviatedEnglish: expect.objectContaining({
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

  test('the functions that define the custom abbreviatedEnglish language return the correct values', () => {
    humanizeDuration(1234)

    const abbreviatedEnglishConfig = hd.mock.calls[0][1].languages.abbreviatedEnglish

    expect(abbreviatedEnglishConfig.y()).toEqual('y')
    expect(abbreviatedEnglishConfig.mo()).toEqual('mo')
    expect(abbreviatedEnglishConfig.w()).toEqual('w')
    expect(abbreviatedEnglishConfig.d()).toEqual('d')
    expect(abbreviatedEnglishConfig.h()).toEqual('h')
    expect(abbreviatedEnglishConfig.m()).toEqual('m')
    expect(abbreviatedEnglishConfig.s()).toEqual('s')
    expect(abbreviatedEnglishConfig.ms()).toEqual('ms')
  })
})
