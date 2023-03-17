import { getProgressPercent } from '../index'

describe('getProgressPercent', () => {
  it('should return 0 if both parameters are 0', () => {
    const result = getProgressPercent(0, 0)
    expect(result).toEqual(0)
  })

  it('should return 100 if both parameters are equal', () => {
    const result = getProgressPercent(10, 10)
    expect(result).toEqual(100)
  })

  it('should return correct percentage with default decimalPlace = 0', () => {
    const result = getProgressPercent(50, 100, 0)
    expect(result).toEqual(50)
  })

  it('should return correct percentage with decimalPlace > 0', () => {
    const result = getProgressPercent(3, 7, 2)
    expect(result).toEqual(42.86)
  })
})
