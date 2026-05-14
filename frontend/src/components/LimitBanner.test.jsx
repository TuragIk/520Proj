import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LimitBanner, { isAtLimit } from './LimitBanner'

const BET_LIMIT_HIT   = { bets_today: 5, max_bets_per_day: 5, amount_today: 20,  max_daily_amount: 50 }
const SPEND_LIMIT_HIT = { bets_today: 2, max_bets_per_day: 5, amount_today: 50,  max_daily_amount: 50 }
const BOTH_LIMITS_HIT = { bets_today: 5, max_bets_per_day: 5, amount_today: 50,  max_daily_amount: 50 }
const UNDER_LIMIT     = { bets_today: 2, max_bets_per_day: 5, amount_today: 20,  max_daily_amount: 50 }


describe('isAtLimit', () => {
  it('returns true when bet count hits limit', () => expect(isAtLimit(BET_LIMIT_HIT)).toBe(true))
  it('returns true when spend hits limit', () => expect(isAtLimit(SPEND_LIMIT_HIT)).toBe(true))
  it('returns true when both limits hit', () => expect(isAtLimit(BOTH_LIMITS_HIT)).toBe(true))
  it('returns false when under both limits', () => expect(isAtLimit(UNDER_LIMIT)).toBe(false))
})


describe('LimitBanner', () => {
  it('shows the gambling helpline number', () => {
    render(<LimitBanner limits={BET_LIMIT_HIT} />)
    expect(screen.getByText('1-800-522-4700')).toBeInTheDocument()
  })

  it('shows the crisis text line', () => {
    render(<LimitBanner limits={BET_LIMIT_HIT} />)
    expect(screen.getByText('Text HOME to 741741')).toBeInTheDocument()
  })

  it('shows Five College counseling resource', () => {
    render(<LimitBanner limits={BET_LIMIT_HIT} />)
    expect(screen.getByText(/Five College Counseling/i)).toBeInTheDocument()
  })

  it('shows bet limit reason when bet count is maxed', () => {
    render(<LimitBanner limits={BET_LIMIT_HIT} />)
    expect(screen.getByText(/placed 5 bets today/i)).toBeInTheDocument()
  })

  it('shows spend limit reason when amount is maxed', () => {
    render(<LimitBanner limits={SPEND_LIMIT_HIT} />)
    expect(screen.getByText(/spent \$50\.00 today/i)).toBeInTheDocument()
  })

  it('shows combined reason when both limits hit', () => {
    render(<LimitBanner limits={BOTH_LIMITS_HIT} />)
    expect(screen.getByText(/daily bet and spending limits/i)).toBeInTheDocument()
  })

  it('shows pause message', () => {
    render(<LimitBanner limits={BET_LIMIT_HIT} />)
    expect(screen.getByText(/bet logging is paused until tomorrow/i)).toBeInTheDocument()
  })
})
