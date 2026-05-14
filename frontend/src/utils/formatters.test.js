import { describe, it, expect } from 'vitest'
import { fmt, pct, fmtVol } from './formatters'

describe('pct', () => {
  it('converts 0.72 to "72%"', () => expect(pct(0.72)).toBe('72%'))
  it('converts 0.5 to "50%"', () => expect(pct(0.5)).toBe('50%'))
  it('converts 0 to "0%"', () => expect(pct(0)).toBe('0%'))
  it('converts 1 to "100%"', () => expect(pct(1)).toBe('100%'))
})

describe('fmt', () => {
  it('formats whole dollars', () => expect(fmt(10)).toBe('$10.00'))
  it('formats cents', () => expect(fmt(10.5)).toBe('$10.50'))
})

describe('fmtVol', () => {
  it('formats millions', () => expect(fmtVol(1_500_000)).toBe('$1.5M'))
  it('formats thousands', () => expect(fmtVol(5_000)).toBe('$5K'))
  it('formats small values under 1000', () => expect(fmtVol(500)).toBe('$500'))
})
