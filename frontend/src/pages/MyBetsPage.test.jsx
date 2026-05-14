import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MyBetsPage from './MyBetsPage'

vi.mock('../api/bets', () => ({
  updateLimits: vi.fn(),
}))

import { updateLimits } from '../api/bets'

const DEFAULT_LIMITS = {
  bets_today: 2,
  max_bets_per_day: 5,
  amount_today: 20.0,
  max_daily_amount: 50.0,
}

const SAMPLE_BETS = [
  {
    id: 'b1',
    platform: 'kalshi',
    event_name: 'BOS @ NYK',
    team_name: 'Boston Celtics',
    amount: 10.0,
    status: 'open',
    placed_at: new Date().toISOString(),
  },
]


describe('MyBetsPage unauthenticated', () => {
  it('shows sign-in prompt when no user', () => {
    render(<MyBetsPage bets={[]} limits={DEFAULT_LIMITS} user={null} onLoginClick={() => {}} onLimitsUpdated={() => {}} />)
    expect(screen.getByText(/sign in to view/i)).toBeInTheDocument()
  })

  it('shows Sign In button when not logged in', () => {
    render(<MyBetsPage bets={[]} limits={DEFAULT_LIMITS} user={null} onLoginClick={() => {}} onLimitsUpdated={() => {}} />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls onLoginClick when Sign In is clicked', () => {
    const onLoginClick = vi.fn()
    render(<MyBetsPage bets={[]} limits={DEFAULT_LIMITS} user={null} onLoginClick={onLoginClick} onLimitsUpdated={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(onLoginClick).toHaveBeenCalled()
  })
})


describe('MyBetsPage authenticated', () => {
  const user = { username: 'test@example.com' }

  it('shows empty state when no bets', () => {
    render(<MyBetsPage bets={[]} limits={DEFAULT_LIMITS} user={user} onLoginClick={() => {}} onLimitsUpdated={() => {}} />)
    expect(screen.getByText(/no bets logged yet/i)).toBeInTheDocument()
  })

  it('shows bet event name when bets exist', () => {
    render(<MyBetsPage bets={SAMPLE_BETS} limits={DEFAULT_LIMITS} user={user} onLoginClick={() => {}} onLimitsUpdated={() => {}} />)
    expect(screen.getByText('BOS @ NYK')).toBeInTheDocument()
  })

  it('shows bet amount', () => {
    render(<MyBetsPage bets={SAMPLE_BETS} limits={DEFAULT_LIMITS} user={user} onLoginClick={() => {}} onLimitsUpdated={() => {}} />)
    expect(screen.getByText('$10.00')).toBeInTheDocument()
  })

  it('shows platform badge for each bet', () => {
    render(<MyBetsPage bets={SAMPLE_BETS} limits={DEFAULT_LIMITS} user={user} onLoginClick={() => {}} onLimitsUpdated={() => {}} />)
    expect(screen.getByText('Kalshi')).toBeInTheDocument()
  })

  it('shows daily stats — bets today vs max', () => {
    render(<MyBetsPage bets={[]} limits={DEFAULT_LIMITS} user={user} onLoginClick={() => {}} onLimitsUpdated={() => {}} />)
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('shows daily stats — spent today vs max', () => {
    render(<MyBetsPage bets={[]} limits={DEFAULT_LIMITS} user={user} onLoginClick={() => {}} onLimitsUpdated={() => {}} />)
    expect(screen.getByText('$20.00 / $50')).toBeInTheDocument()
  })

  it('shows "Saved!" after successful limit update', async () => {
    updateLimits.mockResolvedValue({ ok: true, data: DEFAULT_LIMITS })
    render(<MyBetsPage bets={[]} limits={DEFAULT_LIMITS} user={user} onLoginClick={() => {}} onLimitsUpdated={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText('Saved!')).toBeInTheDocument())
  })

  it('shows error when limit update fails', async () => {
    updateLimits.mockResolvedValue({ ok: false })
    render(<MyBetsPage bets={[]} limits={DEFAULT_LIMITS} user={user} onLoginClick={() => {}} onLimitsUpdated={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText(/failed to save/i)).toBeInTheDocument())
  })
})
