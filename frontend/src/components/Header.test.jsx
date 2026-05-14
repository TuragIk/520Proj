import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'

const NO_USER  = { page: 'home', onNavigate: () => {}, betsCount: 0, user: null,                        onLoginClick: () => {}, onLogout: () => {} }
const WITH_USER = { page: 'home', onNavigate: () => {}, betsCount: 0, user: { username: 'test@example.com' }, onLoginClick: () => {}, onLogout: () => {} }


describe('Header auth state', () => {
  it('shows Sign In button when not logged in', () => {
    render(<Header {...NO_USER} />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows username when logged in', () => {
    render(<Header {...WITH_USER} />)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('shows Sign Out button when logged in', () => {
    render(<Header {...WITH_USER} />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('calls onLogout when Sign Out is clicked', () => {
    const onLogout = vi.fn()
    render(<Header {...WITH_USER} onLogout={onLogout} />)
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    expect(onLogout).toHaveBeenCalled()
  })

  it('calls onLoginClick when Sign In is clicked', () => {
    const onLoginClick = vi.fn()
    render(<Header {...NO_USER} onLoginClick={onLoginClick} />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(onLoginClick).toHaveBeenCalled()
  })
})


describe('Header navigation', () => {
  it('calls onNavigate("bets") when My Bets is clicked', () => {
    const onNavigate = vi.fn()
    render(<Header {...NO_USER} onNavigate={onNavigate} />)
    fireEvent.click(screen.getByText(/My Bets/i))
    expect(onNavigate).toHaveBeenCalledWith('bets')
  })

  it('calls onNavigate("home") when Markets is clicked', () => {
    const onNavigate = vi.fn()
    render(<Header {...NO_USER} page="bets" onNavigate={onNavigate} />)
    fireEvent.click(screen.getByText('Markets'))
    expect(onNavigate).toHaveBeenCalledWith('home')
  })

  it('shows bet count badge when user is logged in and has bets', () => {
    render(<Header {...WITH_USER} betsCount={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not show bet count badge when user is not logged in', () => {
    render(<Header {...NO_USER} betsCount={3} />)
    expect(screen.queryByText('3')).not.toBeInTheDocument()
  })
})
