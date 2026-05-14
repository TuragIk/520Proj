import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MarketRow from './MarketRow'

const AWAY = { abbr: 'BOS', odds: { kalshi: 0.65, polymarket: 0.63 } }
const HOME = { abbr: 'NYK', odds: { kalshi: 0.35, polymarket: 0.37 } }
const VOLUME = { kalshi: 10000, polymarket: 5000 }


describe('MarketRow', () => {
  it('shows away and home odds as percentages for kalshi', () => {
    render(<MarketRow platform="kalshi" away={AWAY} home={HOME} volume={VOLUME} />)
    expect(screen.getByText('65%')).toBeInTheDocument()
    expect(screen.getByText('35%')).toBeInTheDocument()
  })

  it('shows away and home odds as percentages for polymarket', () => {
    render(<MarketRow platform="polymarket" away={AWAY} home={HOME} volume={VOLUME} />)
    expect(screen.getByText('63%')).toBeInTheDocument()
    expect(screen.getByText('37%')).toBeInTheDocument()
  })

  it('shows the Kalshi platform badge', () => {
    render(<MarketRow platform="kalshi" away={AWAY} home={HOME} volume={VOLUME} />)
    expect(screen.getByText('Kalshi')).toBeInTheDocument()
  })

  it('shows the Polymarket platform badge', () => {
    render(<MarketRow platform="polymarket" away={AWAY} home={HOME} volume={VOLUME} />)
    expect(screen.getByText('Polymarket')).toBeInTheDocument()
  })

  it('shows formatted volume', () => {
    render(<MarketRow platform="kalshi" away={AWAY} home={HOME} volume={VOLUME} />)
    expect(screen.getByText('$10K')).toBeInTheDocument()
  })

  it('shows dash when odds are null', () => {
    const awayNoOdds = { abbr: 'BOS', odds: { kalshi: null, polymarket: null } }
    const homeNoOdds = { abbr: 'NYK', odds: { kalshi: null, polymarket: null } }
    const { container } = render(<MarketRow platform="kalshi" away={awayNoOdds} home={homeNoOdds} volume={VOLUME} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders null when both sides have no odds for the platform', () => {
    const awayNoKalshi = { abbr: 'BOS', odds: { kalshi: null, polymarket: 0.6 } }
    const homeNoKalshi = { abbr: 'NYK', odds: { kalshi: null, polymarket: 0.4 } }
    const { container } = render(<MarketRow platform="kalshi" away={awayNoKalshi} home={homeNoKalshi} volume={VOLUME} />)
    expect(container.firstChild).toBeNull()
  })
})
