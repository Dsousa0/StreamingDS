import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import PlayerPage from '../pages/PlayerPage'

const item = { id: 123, title: 'Stranger Things', overview: 'Um menino desaparece...', poster_path: '/abc.jpg' }

function wrap(state = { item, streamerName: 'Netflix' }) {
  return render(
    <AuthContext.Provider value={{ isAuthenticated: true, logout: () => {} }}>
      <MemoryRouter
        initialEntries={[{ pathname: '/player/123', state }]}
      >
        <Routes>
          <Route path="/player/:tmdbId" element={<PlayerPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

test('exibe título do item', () => {
  wrap()
  expect(screen.getByText('Stranger Things')).toBeInTheDocument()
})

test('renderiza iframe com URL do Netflix', () => {
  wrap()
  const iframe = document.querySelector('iframe')
  expect(iframe).not.toBeNull()
  expect(iframe.src).toContain('netflix.com')
})

test('exibe mensagem quando sem item (refresh da página)', () => {
  wrap(null)
  expect(screen.getByText(/conteúdo não encontrado/i)).toBeInTheDocument()
})
