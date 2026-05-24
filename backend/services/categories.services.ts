import CategoryModel from '~/models/Category.model'

class CategoriesService {
  async seedCategories() {
    try {
      const count = await CategoryModel.countDocuments()
      if (count === 0) {
        console.log('[CategoriesService] Seeding default categories...')
        const defaults = [
          { name: 'Ẩm thực', slug: 'food', icon: '🍴', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'rgba(245, 158, 11, 0.2)' },
          { name: 'Phiêu lưu', slug: 'adventure', icon: '🧗', color: '#10b981', bg: 'linear-gradient(135deg, #10b981, #059669)', border: 'rgba(16, 185, 129, 0.2)' },
          { name: 'Văn hóa', slug: 'culture', icon: '🏛️', color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'rgba(139, 92, 246, 0.2)' },
          { name: 'Giải trí đêm', slug: 'nightlife', icon: '💃', color: '#ec4899', bg: 'linear-gradient(135deg, #ec4899, #db2777)', border: 'rgba(236, 72, 153, 0.2)' },
          { name: 'Khác', slug: 'other', icon: '✨', color: '#64748b', bg: 'linear-gradient(135deg, #64748b, #475569)', border: 'rgba(100, 116, 139, 0.2)' }
        ]
        await CategoryModel.insertMany(defaults)
        console.log('[CategoriesService] Seeded default categories successfully!')
      }
    } catch (err) {
      console.error('[CategoriesService] Error seeding default categories:', err)
    }
  }

  async getAllCategories() {
    return CategoryModel.find()
  }
}

const categoriesService = new CategoriesService()
export default categoriesService
