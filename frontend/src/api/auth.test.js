import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { login, logout, getUser, getToken } from './auth'

// FR5: User login/logout — API layer and localStorage persistence
describe('auth API', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns error when username is empty', async () => {
    const result = await login('', 'password')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/username and password/i)
  })

  it('returns error when password is empty', async () => {
    const result = await login('user@test.com', '')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/username and password/i)
  })

  it('stores token and user in localStorage on successful login', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'tok123' }),
    })
    const result = await login('user@test.com', 'password')
    expect(result.ok).toBe(true)
    expect(localStorage.getItem('dg_token')).toBe('tok123')
    expect(JSON.parse(localStorage.getItem('dg_user'))).toEqual({ username: 'user@test.com' })
  })

  it('returns error detail from server on failed login', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Invalid credentials.' }),
    })
    const result = await login('user@test.com', 'wrongpass')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('Invalid credentials.')
  })

  it('falls back to mock token when backend is unreachable', async () => {
    fetch.mockRejectedValue(new Error('Network error'))
    const result = await login('user@test.com', 'anypass')
    expect(result.ok).toBe(true)
    expect(localStorage.getItem('dg_token')).toBe('mock-token')
  })

  it('getUser returns null when not logged in', () => {
    expect(getUser()).toBeNull()
  })

  it('getUser returns stored user after login', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'tok123' }),
    })
    await login('user@test.com', 'password')
    expect(getUser()).toEqual({ username: 'user@test.com' })
  })

  it('getToken returns null when not logged in', () => {
    expect(getToken()).toBeNull()
  })

  it('logout removes token and user from localStorage', async () => {
    localStorage.setItem('dg_token', 'tok123')
    localStorage.setItem('dg_user', JSON.stringify({ username: 'user@test.com' }))
    logout()
    expect(getToken()).toBeNull()
    expect(getUser()).toBeNull()
  })
})
