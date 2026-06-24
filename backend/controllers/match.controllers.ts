import { Request, Response } from 'express'
import ExperienceModel from '../models/Experience.model'
import BuddyProfile from '../models/BuddyProfile.model'
import httpStatus from '../constants/httpStatus'

export const getSmartMatches = async (req: Request, res: Response) => {
  try {
    const { budget, timeOfDay, interests = [], personality, hasMotorbike, english } = req.body

    // Fetch all approved & active tours
    const experiences = await ExperienceModel.find({
      $or: [
        { status: 'approved' },
        { isApproved: true }
      ],
      isActive: true
    }).populate('buddyId', 'name email avatar')

    const matchedResults = await Promise.all(
      experiences.map(async (exp: any) => {
        // Fetch Buddy profile for specialty, personalityTags, hourlyRate, and availability
        const profile = await BuddyProfile.findOne({ userId: exp.buddyId?._id })
        
        let score = 0
        const matchDetails: string[] = []

        // 1. Budget scoring (weight: 25%)
        const experienceHourlyRate = (exp.price || 0) / (exp.minHours || 1)
        if (budget === 'low') {
          if (experienceHourlyRate <= 150000) {
            score += 25
            matchDetails.push('Hợp túi tiền học sinh/sinh viên')
          } else if (experienceHourlyRate <= 250000) {
            score += 15
            matchDetails.push('Chi phí trung bình thấp')
          }
        } else if (budget === 'medium') {
          if (experienceHourlyRate <= 300000) {
            score += 25
            matchDetails.push('Chi phí hợp lý')
          } else {
            score += 10
          }
        } else {
          // high
          score += 25
          matchDetails.push('Chi phí thoải mái')
        }

        // 2. TimeOfDay scoring (weight: 20%)
        const expTags = exp.tags || []
        if (timeOfDay === 'morning') {
          if (expTags.includes('sang') || expTags.includes('sunrise') || exp.title.toLowerCase().includes('sáng') || exp.description.toLowerCase().includes('sáng')) {
            score += 20
            matchDetails.push('Khung giờ buổi sáng mát mẻ')
          } else {
            score += 15
          }
        } else if (timeOfDay === 'afternoon') {
          if (expTags.includes('chieu') || expTags.includes('sunset') || exp.title.toLowerCase().includes('chiều') || exp.description.toLowerCase().includes('chiều')) {
            score += 20
            matchDetails.push('Thời gian buổi chiều lộng gió')
          } else {
            score += 15
          }
        } else if (timeOfDay === 'evening') {
          if (expTags.includes('toi') || expTags.includes('dem') || expTags.includes('nightlife') || exp.title.toLowerCase().includes('tối') || exp.description.toLowerCase().includes('tối') || exp.title.toLowerCase().includes('đêm') || exp.description.toLowerCase().includes('đêm')) {
            score += 20
            matchDetails.push('Không khí nhộn nhịp về đêm')
          } else {
            score += 15
          }
        } else {
          score += 15
        }

        // 3. Interests/Category scoring (weight: 25%)
        let interestMatchCount = 0
        const categoriesMap: Record<string, string> = {
          'am_thuc': 'food',
          'phuot': 'adventure',
          'van_hoa': 'culture',
          'nightlife': 'nightlife',
          'chill': 'other'
        }
        
        interests.forEach((interest: string) => {
          if (categoriesMap[interest] === exp.category) {
            interestMatchCount++
          }
          if (expTags.includes(interest)) {
            interestMatchCount++
          }
        })

        if (interestMatchCount > 0) {
          score += Math.min(25, 15 + interestMatchCount * 5)
          matchDetails.push('Đúng gu hoạt động yêu thích')
        } else {
          score += 5
        }

        // 4. Personality scoring (weight: 15%)
        const personalityTags = profile?.personalityTags || []
        if (personality && (personalityTags.includes(personality) || expTags.includes(personality))) {
          score += 15
          matchDetails.push('Gu tính cách Buddy phù hợp')
        } else if (personality) {
          const combinedText = `${profile?.bio || ''} ${profile?.tagline || ''}`.toLowerCase()
          const keywords: Record<string, string[]> = {
            'nang_dong': ['năng động', 'vui vẻ', 'hài hước', 'nhiệt tình', 'nói nhiều'],
            'sau_sac': ['lắng nghe', 'điềm đạm', 'sâu sắc', 'hiểu biết', 'lịch sử'],
            'am_ap': ['ấm áp', 'chu đáo', 'tinh tế', 'nhẹ nhàng', 'tận tâm']
          }
          const hasKeyword = keywords[personality]?.some(kw => combinedText.includes(kw))
          if (hasKeyword) {
            score += 15
            matchDetails.push('Gu tính cách Buddy tương thích')
          } else {
            score += 8
          }
        } else {
          score += 10
        }

        // 5. Conditions/Utility (weight: 15%)
        let conditionScore = 0
        let conditionMatches = 0
        if (hasMotorbike) {
          if (expTags.includes('xe_may') || expTags.includes('xe_may_dua_don') || exp.description.toLowerCase().includes('xe máy') || exp.includedItems?.some((item: string) => item.toLowerCase().includes('xe máy'))) {
            conditionScore += 7.5
            conditionMatches++
          }
        } else {
          conditionScore += 7.5
        }

        if (english) {
          const langs = profile?.languages || []
          const speaksEnglish = langs.some(l => l.toLowerCase().includes('anh') || l.toLowerCase().includes('english'))
          if (speaksEnglish) {
            conditionScore += 7.5
            conditionMatches++
          }
        } else {
          conditionScore += 7.5
        }

        score += conditionScore
        if (conditionMatches > 0) {
          matchDetails.push('Khớp tiện ích đi kèm mong muốn')
        }

        return {
          ...exp.toJSON(),
          buddyId: {
            _id: exp.buddyId?._id,
            name: exp.buddyId?.name,
            email: exp.buddyId?.email,
            avatar: exp.buddyId?.avatar,
            languages: profile?.languages || [],
            specialties: profile?.specialties || [],
            personalityTags: profile?.personalityTags || [],
            rating: profile?.rating || 0
          },
          score: Math.min(100, Math.round(score)),
          matchDetails: matchDetails.slice(0, 3)
        }
      })
    )

    // Sort by matching score descending
    matchedResults.sort((a, b) => b.score - a.score)

    return res.status(httpStatus.OK).json({ data: matchedResults })
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
  }
}
