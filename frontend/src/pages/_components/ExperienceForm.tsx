import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, DollarSign, Users, Clock, Tag, FileText, AlignLeft, Loader2 } from 'lucide-react'
import { ImageUploader } from './ImageUploader'
import { IncludedItemsList } from './IncludedItemsList'
import type { ExperienceFormValues } from '../../api/experience.api'

// ─── Zod Schema ────────────────────────────────────────────────────────────────

const experienceSchema = z.object({
  title: z.string().min(5, 'Tối thiểu 5 ký tự').max(200, 'Tối đa 200 ký tự'),
  description: z.string().min(10, 'Tối thiểu 10 ký tự').max(2000, 'Tối đa 2000 ký tự'),
  category: z.enum(['food', 'adventure', 'culture', 'nightlife', 'other']),
  city: z.string().optional(),
  price: z
    .number({ message: 'Nhập số hợp lệ' })
    .min(0, 'Giá phải là số dương'),
  currency: z.string().optional(),
  minHours: z.number({ message: 'Nhập số hợp lệ' }).min(0.5, 'Tối thiểu 0.5 giờ'),
  maxGroupSize: z.number({ message: 'Nhập số hợp lệ' }).min(1, 'Tối thiểu 1 người'),
  includedItems: z.array(z.string().min(1)).min(1, 'Thêm ít nhất 1 mục bao gồm'),
  images: z
    .array(z.union([z.custom<File>((v) => v instanceof File), z.string()]))
    .min(1, 'Cần ít nhất 1 ảnh')
    .max(5, 'Tối đa 5 ảnh')
    .refine(
      (files) => files.every((f) => typeof f === 'string' || f.size <= 5 * 1024 * 1024),
      'Mỗi ảnh tối đa 5MB'
    ),
  meetingPoint: z.object({
    longitude: z
      .number({ message: 'Nhập số hợp lệ' })
      .min(107.9, 'Kinh độ phải trong khoảng Đà Nẵng (107.9–108.3)')
      .max(108.3, 'Kinh độ phải trong khoảng Đà Nẵng (107.9–108.3)'),
    latitude: z
      .number({ message: 'Nhập số hợp lệ' })
      .min(15.9, 'Vĩ độ phải trong khoảng Đà Nẵng (15.9–16.3)')
      .max(16.3, 'Vĩ độ phải trong khoảng Đà Nẵng (15.9–16.3)'),
  }),
})

type FormSchema = z.infer<typeof experienceSchema>

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ExperienceFormProps {
  defaultValues?: Partial<ExperienceFormValues>
  onSubmit: (data: ExperienceFormValues) => Promise<void>
  isLoading: boolean
  submitLabel?: string
}

// ─── Style helpers ──────────────────────────────────────────────────────────────

const sectionStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '1.75rem',
  marginBottom: '1.25rem',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.72rem',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginBottom: '0.5rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box' as const,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '0.875rem 0.875rem 0.875rem 2.6rem',
  color: 'white',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
}

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  border: '1px solid rgba(239,68,68,0.5)',
}

const iconWrap: React.CSSProperties = {
  position: 'absolute',
  left: '0.875rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'rgba(255,255,255,0.3)',
  pointerEvents: 'none' as const,
}

const errorText: React.CSSProperties = {
  color: '#fca5a5',
  fontSize: '0.78rem',
  marginTop: '0.35rem',
}

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '1.5rem',
}

const sectionIconStyle = (color: string): React.CSSProperties => ({
  width: '34px',
  height: '34px',
  borderRadius: '10px',
  background: `rgba(${color},0.15)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.85)',
}

// ─── Category options ───────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: 'food', label: '🍜 Ẩm thực' },
  { value: 'adventure', label: '🧗 Phiêu lưu' },
  { value: 'culture', label: '🏛️ Văn hóa' },
  { value: 'nightlife', label: '🌙 Cuộc sống về đêm' },
  { value: 'other', label: '✨ Khác' },
] as const

// ─── Component ─────────────────────────────────────────────────────────────────

export const ExperienceForm = ({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Đăng tour',
}: ExperienceFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      category: defaultValues?.category ?? 'other',
      city: defaultValues?.city ?? 'Da Nang',
      price: defaultValues?.price ?? 0,
      currency: defaultValues?.currency ?? 'VND',
      minHours: defaultValues?.minHours ?? 1,
      maxGroupSize: defaultValues?.maxGroupSize ?? 1,
      includedItems: defaultValues?.includedItems ?? [],
      images: defaultValues?.images ?? [],
      meetingPoint: defaultValues?.meetingPoint ?? { longitude: 108.2022, latitude: 16.0544 },
    },
  })

  const handleFormSubmit = async (data: FormSchema) => {
    await onSubmit(data as ExperienceFormValues)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      {/* ── THÔNG TIN CƠ BẢN ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={sectionIconStyle('99,102,241')}>
            <FileText size={17} style={{ color: '#818cf8' }} />
          </div>
          <h2 style={sectionTitleStyle}>Thông tin cơ bản</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Tiêu đề tour *</label>
            <div style={{ position: 'relative' }}>
              <Tag size={15} style={iconWrap} />
              <input
                {...register('title')}
                placeholder='vd: Khám phá phố cổ Hội An ban đêm...'
                style={errors.title ? inputErrorStyle : inputStyle}
              />
            </div>
            {errors.title && <p style={errorText}>{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Mô tả *</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder='Mô tả chi tiết về trải nghiệm, điểm nổi bật...'
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${errors.description ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px',
                padding: '0.875rem',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical' as const,
                lineHeight: 1.6,
              }}
            />
            {errors.description && <p style={errorText}>{errors.description.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Danh mục *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {CATEGORY_OPTIONS.map((opt) => (
                <label key={opt.value} style={{ cursor: 'pointer' }}>
                  <input {...register('category')} type='radio' value={opt.value} style={{ display: 'none' }} />
                  <Controller
                    name='category'
                    control={control}
                    render={({ field }) => (
                      <span
                        onClick={() => field.onChange(opt.value)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.5rem 1rem',
                          borderRadius: '10px',
                          border: `1px solid ${field.value === opt.value ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.1)'}`,
                          background: field.value === opt.value ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                          color: field.value === opt.value ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          userSelect: 'none',
                        }}
                      >
                        {opt.label}
                      </span>
                    )}
                  />
                </label>
              ))}
            </div>
            {errors.category && <p style={errorText}>{errors.category.message}</p>}
          </div>
        </div>
      </div>

      {/* ── GIÁ & NHÓM ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={sectionIconStyle('16,185,129')}>
            <DollarSign size={17} style={{ color: '#34d399' }} />
          </div>
          <h2 style={sectionTitleStyle}>Giá & Quy mô nhóm</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Price */}
          <div>
            <label style={labelStyle}>Giá (VND) *</label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={15} style={iconWrap} />
              <input
                {...register('price', { valueAsNumber: true })}
                type='number'
                min={0}
                placeholder='150000'
                style={errors.price ? inputErrorStyle : inputStyle}
              />
            </div>
            {errors.price && <p style={errorText}>{errors.price.message}</p>}
          </div>

          {/* Max group size */}
          <div>
            <label style={labelStyle}>Số người tối đa *</label>
            <div style={{ position: 'relative' }}>
              <Users size={15} style={iconWrap} />
              <input
                {...register('maxGroupSize', { valueAsNumber: true })}
                type='number'
                min={1}
                placeholder='6'
                style={errors.maxGroupSize ? inputErrorStyle : inputStyle}
              />
            </div>
            {errors.maxGroupSize && <p style={errorText}>{errors.maxGroupSize.message}</p>}
          </div>

          {/* Min hours */}
          <div>
            <label style={labelStyle}>Thời gian tối thiểu (giờ) *</label>
            <div style={{ position: 'relative' }}>
              <Clock size={15} style={iconWrap} />
              <input
                {...register('minHours', { valueAsNumber: true })}
                type='number'
                min={0.5}
                step={0.5}
                placeholder='2'
                style={errors.minHours ? inputErrorStyle : inputStyle}
              />
            </div>
            {errors.minHours && <p style={errorText}>{errors.minHours.message}</p>}
          </div>

          {/* City */}
          <div>
            <label style={labelStyle}>Thành phố</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} style={iconWrap} />
              <input
                {...register('city')}
                placeholder='Da Nang'
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── ĐIỂM HẸN ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={sectionIconStyle('251,191,36')}>
            <MapPin size={17} style={{ color: '#fbbf24' }} />
          </div>
          <h2 style={sectionTitleStyle}>Điểm hẹn gặp</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Kinh độ (Longitude) *</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} style={iconWrap} />
              <input
                {...register('meetingPoint.longitude', { valueAsNumber: true })}
                type='number'
                step='0.0001'
                placeholder='108.2022'
                style={errors.meetingPoint?.longitude ? inputErrorStyle : inputStyle}
              />
            </div>
            {errors.meetingPoint?.longitude && (
              <p style={errorText}>{errors.meetingPoint.longitude.message}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Vĩ độ (Latitude) *</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} style={iconWrap} />
              <input
                {...register('meetingPoint.latitude', { valueAsNumber: true })}
                type='number'
                step='0.0001'
                placeholder='16.0544'
                style={errors.meetingPoint?.latitude ? inputErrorStyle : inputStyle}
              />
            </div>
            {errors.meetingPoint?.latitude && (
              <p style={errorText}>{errors.meetingPoint.latitude.message}</p>
            )}
          </div>
        </div>

        <div style={{
          marginTop: '0.875rem',
          background: 'rgba(251,191,36,0.07)',
          border: '1px solid rgba(251,191,36,0.15)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
        }}>
          <p style={{ color: 'rgba(251,191,36,0.8)', fontSize: '0.75rem', margin: 0 }}>
            📍 Toạ độ phải nằm trong khu vực Đà Nẵng: Kinh độ 107.9–108.3 · Vĩ độ 15.9–16.3
          </p>
        </div>
      </div>

      {/* ── BAO GỒM ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={sectionIconStyle('14,165,233')}>
            <AlignLeft size={17} style={{ color: '#38bdf8' }} />
          </div>
          <h2 style={sectionTitleStyle}>Bao gồm trong tour *</h2>
        </div>

        <Controller
          name='includedItems'
          control={control}
          render={({ field }) => (
            <IncludedItemsList
              value={field.value}
              onChange={field.onChange}
              error={errors.includedItems?.message as string | undefined}
            />
          )}
        />
      </div>

      {/* ── ẢNH ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={sectionIconStyle('236,72,153')}>
            <span style={{ fontSize: '1rem' }}>📸</span>
          </div>
          <div>
            <h2 style={sectionTitleStyle}>Ảnh tour *</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
              Tối đa 5 ảnh · JPEG, PNG, WebP · Mỗi ảnh ≤ 5MB
            </p>
          </div>
        </div>

        <Controller
          name='images'
          control={control}
          render={({ field }) => (
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              maxFiles={5}
              error={errors.images?.message as string | undefined}
            />
          )}
        />
      </div>

      {/* ── SUBMIT ── */}
      <button
        type='submit'
        disabled={isLoading}
        style={{
          width: '100%',
          background: isLoading
            ? 'rgba(255,255,255,0.08)'
            : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          border: 'none',
          borderRadius: '14px',
          padding: '1.1rem',
          color: isLoading ? 'rgba(255,255,255,0.4)' : 'white',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: isLoading ? 'none' : '0 8px 24px rgba(139,92,246,0.4)',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
            Đang xử lý...
          </>
        ) : (
          <>🚀 {submitLabel}</>
        )}
      </button>
    </form>
  )
}
