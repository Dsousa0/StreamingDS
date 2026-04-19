import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import PrivateRoute from '../components/PrivateRoute'

function wrap(isAuthenticated, initialPath = '/dashboard') {
  return render(
    <AuthContext.Provider value={{ isAuthenticated }}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<div>Login</div>} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<div>Protected</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

test('renderiza conteúdo protegido quando autenticado', () => {
  wrap(true)
  expect(screen.getByText('Protected')).toBeInTheDocument()
})

test('redireciona para / quando não autenticado', () => {
  wrap(false)
  expect(screen.getByText('Login')).toBeInTheDocument()
  expect(screen.queryByText('Protected')).not.toBeInTheDocument()
})
