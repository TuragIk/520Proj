import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginModal from './LoginModal'

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
}))

import { login } from '../api/auth'

beforeEach(() => vi.clearAllMocks())


describe('LoginModal', () => {
  it('renders username and password fields', () => {
    render(<LoginModal onLogin={() => {}} onClose={() => {}} />)
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('renders a Sign In submit button', () => {
    render(<LoginModal onLogin={() => {}} onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls onLogin with user object on successful login', async () => {
    login.mockResolvedValue({ ok: true, user: { username: 'test@example.com' } })
    const onLogin = vi.fn()
    render(<LoginModal onLogin={onLogin} onClose={() => {}} />)

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith({ username: 'test@example.com' }))
  })

  it('shows error message on failed login', async () => {
    login.mockResolvedValue({ ok: false, error: 'Invalid credentials.' })
    render(<LoginModal onLogin={() => {}} onClose={() => {}} />)

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(screen.getByText('Invalid credentials.')).toBeInTheDocument())
  })

  it('does not call onLogin on failed login', async () => {
    login.mockResolvedValue({ ok: false, error: 'Invalid credentials.' })
    const onLogin = vi.fn()
    render(<LoginModal onLogin={onLogin} onClose={() => {}} />)

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(screen.getByText('Invalid credentials.')).toBeInTheDocument())
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('calls onClose when × button is clicked', () => {
    const onClose = vi.fn()
    render(<LoginModal onLogin={() => {}} onClose={onClose} />)
    fireEvent.click(screen.getByText('×'))
    expect(onClose).toHaveBeenCalled()
  })
})
