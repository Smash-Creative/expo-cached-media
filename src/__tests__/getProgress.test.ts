import { getProgress } from '../index'

describe('getProgress', () => {
  it('returns 0 when totalBytesWritten is 0', () => {
    expect(getProgress(0, 100)).toBe(0)
  })
  it('returns 1 when totalBytesWritten equals totalBytesExpectedToWrite', () => {
    expect(getProgress(100, 100)).toBe(1)
  })
  it('returns decimal value rounded to 3 decimal places', () => {
    expect(getProgress(203, 1000)).toBe(0.203)
  })
  it('returns decimal value rounded to 2 decimal places', () => {
    expect(getProgress(203, 1000)).toBe(0.2)
  })
})
