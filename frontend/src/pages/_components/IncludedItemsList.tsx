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
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '10px',
    padding: '0.7rem 1rem',
    color: 'white',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const addBtnStyle: React.CSSProperties = {
    background: 'rgba(139,92,246,0.2)',
    border: '1px solid rgba(139,92,246,0.4)',
    borderRadius: '10px',
    padding: '0.7rem 1rem',
    color: '#c4b5fd',
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
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '8px',
    padding: '0.35rem 0.75rem',
    color: '#a5b4fc',
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'rgba(165,180,252,0.6)' }}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && (
        <p style={{ color: '#fca5a5', fontSize: '0.8rem', margin: 0 }}>⚠️ {error}</p>
      )}
    </div>
  )
}
