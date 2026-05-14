import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GameCard from './GameCard'

const BASE_GAME = {
  game_time: '2025-06-01T20:00:00Z',
  away: { abbr: 'BOS', name: 'Boston Celtics', color: '#007A33', odds: { kalshi: 0.65, polymarket: 0.63 } },
  home: { abbr: 'NYK', name: 'New York Knicks', color: '#006BB6', odds: { kalshi: 0.35, polymarket: 0.37 } },
  volume: { kalshi: 10000, polymarket: 5000 },
  arbitrage: { exists: false },
}

const ARBITRAGE_GAME = {
  ...BASE_GAME,
  arbitrage: { exists: true, description: 'Buy BOS on Kalshi, NYK on Polymarket for guaranteed profit.' },
}


describe('GameCard display', () => {
  it('shows team abbreviations', () => {
    render(<GameCard game={BASE_GAME} onSelect={() => {}} />)
    expect(screen.getByText('BOS')).toBeInTheDocument()
    expect(screen.getByText('NYK')).toBeInTheDocument()
  })

  it('shows full team names', () => {
    render(<GameCard game={BASE_GAME} onSelect={() => {}} />)
    expect(screen.getByText(/Boston Celtics/)).toBeInTheDocument()
    expect(screen.getByText(/New York Knicks/)).toBeInTheDocument()
  })

  it('shows both platform rows', () => {
    render(<GameCard game={BASE_GAME} onSelect={() => {}} />)
    expect(screen.getByText('Kalshi')).toBeInTheDocument()
    expect(screen.getByText('Polymarket')).toBeInTheDocument()
  })

  it('shows total volume', () => {
    render(<GameCard game={BASE_GAME} onSelect={() => {}} />)
    expect(screen.getByText(/\$15K total volume/i)).toBeInTheDocument()
  })

  it('calls onSelect with the game when clicked', () => {
    const onSelect = vi.fn()
    render(<GameCard game={BASE_GAME} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('BOS'))
    expect(onSelect).toHaveBeenCalledWith(BASE_GAME)
  })
})


describe('GameCard arbitrage', () => {
  it('shows ARBITRAGE badge when arbitrage exists', () => {
    render(<GameCard game={ARBITRAGE_GAME} onSelect={() => {}} />)
    expect(screen.getByText('ARBITRAGE')).toBeInTheDocument()
  })

  it('does not show ARBITRAGE badge when no arbitrage', () => {
    render(<GameCard game={BASE_GAME} onSelect={() => {}} />)
    expect(screen.queryByText('ARBITRAGE')).not.toBeInTheDocument()
  })

  it('shows arbitrage description text', () => {
    render(<GameCard game={ARBITRAGE_GAME} onSelect={() => {}} />)
    expect(screen.getByText(/guaranteed profit/i)).toBeInTheDocument()
  })

  it('does not show arbitrage description when no arbitrage', () => {
    render(<GameCard game={BASE_GAME} onSelect={() => {}} />)
    expect(screen.queryByText(/guaranteed profit/i)).not.toBeInTheDocument()
  })
})
