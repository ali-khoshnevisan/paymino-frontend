import { describe, expect, it } from 'vitest'
import { safeRedirect, toAsciiDigits } from '../app/utils/format'

describe('safeRedirect', () => {
  it('keeps internal paths', () => {
    expect(safeRedirect('/checkout?step=4')).toBe('/checkout?step=4')
  })
  it('blocks open redirects', () => {
    expect(safeRedirect('https://evil.example')).toBe('/account')
    expect(safeRedirect('//evil.example')).toBe('/account')
    expect(safeRedirect('/\\evil.example')).toBe('/account')
    expect(safeRedirect(undefined)).toBe('/account')
  })
})

describe('toAsciiDigits', () => {
  it('converts Persian and Arabic digits', () => {
    expect(toAsciiDigits('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789')
    expect(toAsciiDigits('٠١٢')).toBe('012')
  })
})
