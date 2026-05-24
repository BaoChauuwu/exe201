import { useState } from 'react'
import { Plus, X } from 'lucide-react'

interface IncludedItemsListProps {
  value: string[]
  onChange: (items: string[]) => void
  error?: string
}

export const IncludedItemsList = ({ value, onChange, error }: IncludedItemsListProps) => {
  const [input, setInput] = useState('')

  const addItem = () => {
    const trimmed = input.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput('')
  }

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem',
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: '#f8fafc',
    border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(14, 165, 233, 0.2)'}`,
    borderRadius: '10px',
    padding: '0.7rem 1rem',
    color: '#0f172a',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const addBtnStyle: React.CSSProperties = {
    background: 'rgba(79,70,229,0.1)',
    border: '1px solid rgba(79,70,229,0.2)',
    borderRadius: '10px',
    padding: '0.7rem 1rem',
    color: '#4f46e5',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
  }

  const tagStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(79,70,229,0.08)',
    border: '1px solid rgba(79,70,229,0.2)',
    borderRadius: '8px',
    padding: '0.35rem 0.75rem',
    color: '#4f46e5',
    fontSize: '0.8rem',
    fontWeight: 500,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={inputRowStyle}>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder='vd: Hướng dẫn viên, Nước uống, Bữa sáng...'
          style={inputStyle}
        />
        <button type='button' onClick={addItem} style={addBtnStyle}>
          <Plus size={15} /> Thêm
        </button>
      </div>

      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {value.map((item, i) => (
            <span key={i} style={tagStyle}>
              ✓ {item}
              <button
                type='button'
                onClick={() => removeAt(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#6366f1' }}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>⚠️ {error}</p>
      )}
    </div>
  )
}
