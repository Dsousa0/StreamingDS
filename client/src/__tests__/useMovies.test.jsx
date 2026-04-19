import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { CredentialsContext } from '../contexts/CredentialsContext'
import useMovies from '../hooks/useMovies'
import api from '../services/api'

vi.mock('../services/api', () => ({ default: { get: vi.fn() } }))

const wrapper = ({ children }) => (
  <CredentialsContext.Provider value={{ activeProviderIds: [8] }}>
    {children}
  </CredentialsContext.Provider>
)

test('busca filmes e retorna results', async () => {
  api.get.mockResolvedValue({
    data: { results: [{ id: 1, title: 'Filme Teste' }], total_pages: 3 },
  })
  const { result } = renderHook(() => useMovies(1, ''), { wrapper })
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.movies).toEqual([{ id: 1, title: 'Filme Teste' }])
  expect(result.current.totalPages).toBe(3)
  expect(api.get).toHaveBeenCalledWith('/api/stream/movies', { params: { page: 1 } })
})

test('passa genre nos params quando fornecido', async () => {
  api.get.mockResolvedValue({ data: { results: [], total_pages: 1 } })
  const { result } = renderHook(() => useMovies(1, '28'), { wrapper })
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(api.get).toHaveBeenCalledWith('/api/stream/movies', { params: { page: 1, genre: '28' } })
})
