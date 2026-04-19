import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthContext } from '../contexts/AuthContext'
import LoginPage from '../pages/LoginPage'

function wrap(loginFn = vi.fn(), isAuthenticated = false) {
  return render(
    <AuthContext.Provider value={{ login: loginFn, isAuthenticated }}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

test('renderiza campos de usuário e senha', () => {
  wrap()
  expect(screen.getByPlaceholderText('Usuário')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
})

test('chama login com username e password ao submeter', async () => {
  const loginFn = vi.fn().mockResolvedValue(undefined)
  wrap(loginFn)
  fireEvent.change(screen.getByPlaceholderText('Usuário'), { target: { value: 'admin' } })
  fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'secret' } })
  fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
  await waitFor(() => expect(loginFn).toHaveBeenCalledWith('admin', 'secret'))
})

test('exibe toast de erro quando login falha', async () => {
  const loginFn = vi.fn().mockRejectedValue({
    response: { data: { error: { message: 'Credenciais inválidas' } } },
  })
  wrap(loginFn)
  fireEvent.change(screen.getByPlaceholderText('Usuário'), { target: { value: 'x' } })
  fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'x' } })
  fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
  await waitFor(() => expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument())
})
