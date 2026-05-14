import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlatformBadge from './PlatformBadge'

describe('PlatformBadge', () => {
  it('renders "Kalshi" for kalshi platform', () => {
    render(<PlatformBadge platform="kalshi" />)
    expect(screen.getByText('Kalshi')).toBeInTheDocument()
  })

  it('renders "Polymarket" for polymarket platform', () => {
    render(<PlatformBadge platform="polymarket" />)
    expect(screen.getByText('Polymarket')).toBeInTheDocument()
  })
})
