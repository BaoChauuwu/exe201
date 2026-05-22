import React, { useState, useRef, useCallback } from 'react'
import { UploadCloud, X, CheckCircle, Image } from 'lucide-react'

interface ImageUploaderProps {
  value: (File | string)[]
  onChange: (files: (File | string)[]) => void
  maxFiles?: number
  error?: string
}

const toObjectURL = (file: File): string => URL.createObjectURL(file)

export const ImageUploader = ({ value, onChange, maxFiles = 5, error }: ImageUploaderProps) => {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const getPreviewSrc = (item: File | string): string =>
    item instanceof File ? toObjectURL(item) : item

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return
      const newFiles = Array.from(incoming).filter((f) => f.type.startsWith('image/'))
      const combined = [...value, ...newFiles].slice(0, maxFiles)
      onChange(combined)
    },
    [value, onChange, maxFiles]
  )

  const removeAt = (index: number) => {
    const next = value.filter((_, i) => i !== index)
    onChange(next)
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  }

  const dropZoneStyle: React.CSSProperties = {
    border: `2px dashed ${dragging ? '#8b5cf6' : error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}`,
    borderRadius: '16px',
    padding: '2rem 1rem',
    textAlign: 'center',
    cursor: value.length >= maxFiles ? 'not-allowed' : 'pointer',
    background: dragging ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
    transition: 'all 0.2s',
    opacity: value.length >= maxFiles ? 0.5 : 1,
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    gap: '0.75rem',
  }

  const thumbStyle: React.CSSProperties = {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    aspectRatio: '1',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
  }

  return (
    <div style={containerStyle}>
      {/* Preview grid */}
      {value.length > 0 && (
        <div style={gridStyle}>
          {value.map((item, i) => (
            <div key={i} style={thumbStyle}>
              <img
                src={getPreviewSrc(item)}
                alt={`preview-${i}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Hover overlay */}
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              >
                <button
                  type='button'
                  onClick={() => removeAt(i)}
                  style={{
                    background: 'rgba(239,68,68,0.9)', border: 'none',
                    borderRadius: '50%', width: '32px', height: '32px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={15} color='white' />
                </button>
              </div>
              {/* Index badge */}
              <div style={{
                position: 'absolute', top: '6px', left: '6px',
                background: 'rgba(0,0,0,0.65)', borderRadius: '6px',
                padding: '2px 7px', fontSize: '0.65rem', fontWeight: 700, color: 'white',
              }}>
                {i === 0 ? '⭐ Chính' : `${i + 1}`}
              </div>
              {/* Cloudinary badge */}
              {typeof item === 'string' && (
                <div style={{
                  position: 'absolute', bottom: '6px', right: '6px',
                  background: 'rgba(16,185,129,0.85)', borderRadius: '6px',
                  padding: '2px 7px', display: 'flex', alignItems: 'center', gap: '3px',
                  fontSize: '0.6rem', fontWeight: 700, color: 'white',
                }}>
                  <CheckCircle size={9} /> Cũ
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {value.length < maxFiles && (
        <div
          style={dropZoneStyle}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            multiple
            style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)}
          />
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: dragging ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.875rem', transition: 'all 0.2s',
          }}>
            {dragging ? (
              <UploadCloud size={22} style={{ color: '#a78bfa' }} />
            ) : (
              <Image size={22} style={{ color: 'rgba(255,255,255,0.3)' }} />
            )}
          </div>
          <p style={{ color: dragging ? '#c4b5fd' : 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', margin: '0 0 0.35rem' }}>
            {dragging ? 'Thả ảnh vào đây' : 'Kéo thả hoặc click để chọn ảnh'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', margin: 0 }}>
            JPEG, PNG, WebP — tối đa 5MB/ảnh · còn {maxFiles - value.length}/{maxFiles} slot
          </p>
        </div>
      )}

      {error && (
        <p style={{ color: '#fca5a5', fontSize: '0.8rem', margin: 0 }}>⚠️ {error}</p>
      )}
    </div>
  )
}
