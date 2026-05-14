import { describe, it, expect, beforeEach } from 'vitest'
import { getBets, getLimits, addBet } from './bets'

// FR2: Frequency limit enforcement — localStorage fallback path
// (no real token → always uses local limit checks)
const BET = {
  game_id: 'game1',
  event_name: 'BOS @ NYK',
  platform: 'kalshi',
  team: 'home',
  team_name: 'Boston Celtics',
  amount: 10,
  price_at_entry: 0.65,
}

beforeEach(() => {
  localStorage.clear()
})

describe('getBets', () => {
  it('returns empty array when nothing stored', () => {
    expect(getBets()).toEqual([])
  })
})

describe('getLimits', () => {
  it('returns default limits when nothing stored', () => {
    const limits = getLimits()
    expect(limits.max_bets_per_day).toBe(5)
    expect(limits.max_daily_amount).toBe(50.0)
    expect(limits.bets_today).toBe(0)
    expect(limits.amount_today).toBe(0.0)
  })

  it('resets daily counters when stored date is not today', () => {
    localStorage.setItem('dg_limits', JSON.stringify({
      date: 'Mon Jan 01 2000',
      bets_today: 99,
      amount_today: 999,
    }))
    const limits = getLimits()
    expect(limits.bets_today).toBe(0)
    expect(limits.amount_today).toBe(0.0)
  })
})

describe('addBet — localStorage fallback (FR2)', () => {
  it('adds a bet and returns ok:true', async () => {
    const result = await addBet(BET)
    expect(result.ok).toBe(true)
    expect(getBets()).toHaveLength(1)
  })

  it('increments bets_today after placing a bet', async () => {
    await addBet(BET)
    expect(getLimits().bets_today).toBe(1)
  })

  it('increments amount_today after placing a bet', async () => {
    await addBet(BET)
    expect(getLimits().amount_today).toBe(10)
  })

  it('rejects a bet when daily bet limit is reached', async () => {
    localStorage.setItem('dg_limits', JSON.stringify({
      date: new Date().toDateString(),
      bets_today: 5,
      amount_today: 0,
      max_bets_per_day: 5,
      max_daily_amount: 50,
    }))
    const result = await addBet(BET)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('daily_bet_limit')
  })

  it('rejects a bet when daily spend limit would be exceeded', async () => {
    localStorage.setItem('dg_limits', JSON.stringify({
      date: new Date().toDateString(),
      bets_today: 0,
      amount_today: 45,
      max_bets_per_day: 5,
      max_daily_amount: 50,
    }))
    const result = await addBet({ ...BET, amount: 10 })
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('daily_amount_limit')
  })

  it('allows a bet that fits within both limits', async () => {
    localStorage.setItem('dg_limits', JSON.stringify({
      date: new Date().toDateString(),
      bets_today: 4,
      amount_today: 39,
      max_bets_per_day: 5,
      max_daily_amount: 50,
    }))
    const result = await addBet({ ...BET, amount: 10 })
    expect(result.ok).toBe(true)
  })
})
