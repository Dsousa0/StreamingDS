import { useEffect } from 'react'

const COLORS = {
  error: 'bg-red-500',
  success: 'bg-green-600',
  info: 'bg-sky-500',
}

export default function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg text-white text-sm shadow-xl max-w-xs ${COLORS[type]}`}
    >
      {message}
    </div>
  )
}
