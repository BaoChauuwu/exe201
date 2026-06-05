import { config } from 'dotenv'
config()
import mongoose from 'mongoose'
import BookingModel from './models/Booking.model'

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.dbbh1tu.mongodb.net/`

async function run() {
  const args = process.argv.slice(2);
  const targetBookingCode = args[0]; // Có thể truyền mã vé làm tham số: npx tsx make-booking-past.ts BK-XXXXXX

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: process.env.DB_NAME })
    console.log('Connected successfully.');

    let booking;
    if (targetBookingCode) {
      booking = await BookingModel.findOne({ bookingCode: targetBookingCode.toUpperCase() });
    } else {
      // Tìm booking mới nhất đang ở trạng thái 'confirmed' hoặc 'ongoing'
      booking = await BookingModel.findOne({ 
        status: { $in: ['confirmed', 'ongoing'] } 
      }).sort({ created_at: -1 });
    }

    if (!booking) {
      console.log('Không tìm thấy booking nào phù hợp để cập nhật.');
      process.exit(0);
    }

    console.log(`Đã tìm thấy booking:`);
    console.log(`- ID: ${booking._id}`);
    console.log(`- Mã vé: ${booking.bookingCode}`);
    console.log(`- Trạng thái: ${booking.status}`);
    console.log(`- Ngày đi hiện tại: ${booking.scheduledDate.toLocaleDateString('vi-VN')} lúc ${booking.startTime} (${booking.hours} giờ)`);

    // Chuyển thời gian sao cho thời điểm kết thúc tour vừa mới trôi qua 1 phút trước
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000); // 1 phút trước
    
    booking.scheduledDate = oneMinuteAgo;
    
    const hh = String(oneMinuteAgo.getHours()).padStart(2, '0');
    const mm = String(oneMinuteAgo.getMinutes()).padStart(2, '0');
    booking.startTime = `${hh}:${mm}`;
    booking.hours = 0; // Đặt số giờ là 0 để tour kết thúc ngay lập tức

    await booking.save();

    console.log('\n=== CẬP NHẬT THÀNH CÔNG ===');
    console.log(`Booking ${booking.bookingCode} đã được điều chỉnh kết thúc vào lúc ${hh}:${mm} hôm nay (đã kết thúc cách đây 1 phút).`);
    console.log('Bây giờ chuyến đi đã kết thúc. Bạn có thể nhấn nút "Xác nhận hoàn thành" để kiểm tra giải ngân!');
    
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi cập nhật database:', err);
    process.exit(1);
  }
}

run();
