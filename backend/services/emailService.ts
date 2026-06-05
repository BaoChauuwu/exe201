import nodemailer from 'nodemailer'
import { config } from 'dotenv'
config()

// Khởi tạo transporter dựa trên các biến môi trường
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: (process.env.EMAIL_PORT === '465'), // true cho port 465, false cho các port khác
  auth: {
    user: (process.env.EMAIL_USER || process.env.SMTP_EMAIL) as string,
    pass: (process.env.EMAIL_PASS || process.env.SMTP_PASSWORD) as string
  }
})

// Mẫu HTML xác nhận dành cho Tourist
const buildTouristHtml = (bookingData: any, buddyInfo: any, experienceTitle: string) => {
  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.totalPrice)
  const scheduledDateStr = new Date(bookingData.scheduledDate).toLocaleDateString('vi-VN')
  
  return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Xác nhận đặt tour thành công - UniTravel</title>
    <style>
      body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; color: #333333; }
      .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
      .header { background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
      .header p { margin: 5px 0 0; font-size: 14px; opacity: 0.9; }
      .body { padding: 32px 24px; }
      .success-title { color: #10b981; font-size: 18px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
      .info-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
      .info-title { font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 0; margin-bottom: 15px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
      .info-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
      .info-row:last-child { margin-bottom: 0; }
      .info-label { color: #64748b; }
      .info-value { font-weight: 600; color: #0f172a; }
      .highlight { color: #2563eb; font-weight: 700; }
      .buddy-card { display: flex; align-items: center; gap: 15px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 15px; margin-bottom: 24px; }
      .buddy-avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #ffffff; }
      .buddy-details { font-size: 14px; }
      .buddy-name { font-weight: 700; color: #1e3a8a; }
      .buddy-contact { color: #475569; font-size: 12px; margin-top: 2px; }
      .cta-btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 700; text-align: center; width: 80%; display: block; margin: 0 auto; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
      .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>✈️ UniTravel</h1>
        <p>Hành trình kết nối sinh viên bản địa</p>
      </div>
      <div class="body">
        <div class="success-title">🎉 Đặt tour thành công! Cảm ơn bạn!</div>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
          Xin chào! Giao dịch của bạn đã được cổng thanh toán xác nhận thành công. Chuyến đi khám phá trải nghiệm của bạn đã sẵn sàng bắt đầu.
        </p>
        
        <div class="info-section">
          <div class="info-title">CHI TIẾT ĐẶT TOUR</div>
          <div class="info-row">
            <span class="info-label">Tên trải nghiệm:</span>
            <span class="info-value">${experienceTitle}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Mã đặt chỗ:</span>
            <span class="info-value highlight" style="font-family: monospace;">${bookingData.bookingCode}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ngày đi:</span>
            <span class="info-value">${scheduledDateStr}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Giờ bắt đầu:</span>
            <span class="info-value">${bookingData.startTime}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Số giờ:</span>
            <span class="info-value">${bookingData.hours} giờ</span>
          </div>
          <div class="info-row">
            <span class="info-label">Số lượng khách:</span>
            <span class="info-value">${bookingData.groupSize} người</span>
          </div>
          <div class="info-row" style="border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 10px;">
            <span class="info-label" style="font-weight: bold; color: #0f172a;">Tổng tiền đã thanh toán:</span>
            <span class="info-value highlight" style="font-size: 16px;">${formattedPrice}</span>
          </div>
        </div>
        
        <p style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 10px;">👤 THÔNG TIN TOUR BUDDY CỦA BẠN:</p>
        <div class="buddy-card">
          <img class="buddy-avatar" src="${buddyInfo.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(buddyInfo.name || 'U') + '&background=0ea5e9&color=fff'}" alt="Buddy avatar" />
          <div class="buddy-details">
            <div class="buddy-name">${buddyInfo.name}</div>
            <div class="buddy-contact">Email: ${buddyInfo.email}</div>
            ${buddyInfo.phone ? `<div class="buddy-contact">Số điện thoại: ${buddyInfo.phone}</div>` : ''}
          </div>
        </div>
        
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 25px; text-align: center;">
          Bạn có thể nhắn tin trực tiếp với Buddy trên UniTravel để trao đổi cụ thể hơn về lịch trình, trang phục và địa điểm gặp mặt.
        </p>
        
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-bookings" class="cta-btn">🗺️ Xem Chuyến đi của tôi</a>
      </div>
      <div class="footer">
        © UniTravel. Email này được gửi tự động, vui lòng không trả lời.
      </div>
    </div>
  </body>
  </html>
  `
}

// Mẫu HTML thông báo dành cho Buddy
const buildBuddyHtml = (bookingData: any, touristInfo: any, experienceTitle: string) => {
  const formattedEarning = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.buddyEarning)
  const scheduledDateStr = new Date(bookingData.scheduledDate).toLocaleDateString('vi-VN')
  
  return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Bạn có lịch đặt tour mới! - UniTravel</title>
    <style>
      body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; color: #333333; }
      .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
      .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
      .header p { margin: 5px 0 0; font-size: 14px; opacity: 0.9; }
      .body { padding: 32px 24px; }
      .success-title { color: #7c3aed; font-size: 18px; font-weight: 700; margin-bottom: 20px; }
      .info-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
      .info-title { font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 0; margin-bottom: 15px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
      .info-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
      .info-row:last-child { margin-bottom: 0; }
      .info-label { color: #64748b; }
      .info-value { font-weight: 600; color: #0f172a; }
      .highlight { color: #7c3aed; font-weight: 700; }
      .tourist-card { display: flex; align-items: center; gap: 15px; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 15px; margin-bottom: 24px; }
      .tourist-avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #ffffff; }
      .tourist-details { font-size: 14px; }
      .tourist-name { font-weight: 700; color: #4c1d95; }
      .tourist-contact { color: #475569; font-size: 12px; margin-top: 2px; }
      .cta-btn { display: inline-block; background: #7c3aed; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 700; text-align: center; width: 80%; display: block; margin: 0 auto; box-shadow: 0 4px 12px rgba(124,58,237,0.2); }
      .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>✈️ UniTravel</h1>
        <p>Hành trình kết nối sinh viên bản địa</p>
      </div>
      <div class="body">
        <div class="success-title">📅 Bạn có lịch đặt tour mới!</div>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
          Xin chào Buddy! Khách du lịch đã thanh toán thành công và đặt tour trải nghiệm của bạn. Hãy kiểm tra thông tin dưới đây và chuẩn bị đón tiếp khách nhé.
        </p>
        
        <div class="info-section">
          <div class="info-title">THÔNG TIN ĐẶT LỊCH</div>
          <div class="info-row">
            <span class="info-label">Trải nghiệm:</span>
            <span class="info-value">${experienceTitle}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Mã đặt chỗ:</span>
            <span class="info-value highlight" style="font-family: monospace;">${bookingData.bookingCode}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ngày dẫn:</span>
            <span class="info-value">${scheduledDateStr}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Giờ khởi hành:</span>
            <span class="info-value">${bookingData.startTime}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Thời lượng:</span>
            <span class="info-value">${bookingData.hours} giờ</span>
          </div>
          <div class="info-row">
            <span class="info-label">Số lượng khách:</span>
            <span class="info-value">${bookingData.groupSize} người</span>
          </div>
          <div class="info-row" style="border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 10px;">
            <span class="info-label" style="font-weight: bold; color: #0f172a;">Thu nhập tạm tính của bạn:</span>
            <span class="info-value highlight" style="font-size: 16px;">${formattedEarning}</span>
          </div>
        </div>
        
        <p style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 10px;">👤 THÔNG TIN KHÁCH DU LỊCH (TOURIST):</p>
        <div class="tourist-card">
          <img class="tourist-avatar" src="${touristInfo.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(touristInfo.name || 'U') + '&background=7c3aed&color=fff'}" alt="Tourist avatar" />
          <div class="tourist-details">
            <div class="tourist-name">${touristInfo.name}</div>
            <div class="tourist-contact">Email: ${touristInfo.email}</div>
            ${touristInfo.phone ? `<div class="tourist-contact">Số điện thoại: ${touristInfo.phone}</div>` : ''}
          </div>
        </div>
        
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 25px; text-align: center;">
          Hãy vào phần Chat trên UniTravel để làm quen và hẹn điểm gặp cụ thể với khách hàng nhé.
        </p>
        
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-bookings" class="cta-btn">🗺️ Quản lý Lịch dẫn của tôi</a>
      </div>
      <div class="footer">
        © UniTravel. Email này được gửi tự động, vui lòng không trả lời.
      </div>
    </div>
  </body>
  </html>
  `
}

class EmailService {
  /**
   * Gửi email xác nhận đặt tour thành công cho Tourist
   */
  async sendTouristConfirmation(touristEmail: string, bookingData: any, buddyInfo: any, experienceTitle: string) {
    try {
      await transporter.sendMail({
        from: `"UniTravel" <${process.env.EMAIL_USER || process.env.SMTP_EMAIL}>`,
        to: touristEmail,
        subject: `✅ Xác nhận đặt tour thành công - Mã vé ${bookingData.bookingCode}`,
        html: buildTouristHtml(bookingData, buddyInfo, experienceTitle)
      })
      console.log(`[EmailService] Đã gửi email xác nhận cho Tourist: ${touristEmail}`)
    } catch (error) {
      console.error('[EmailService] Lỗi khi gửi email cho Tourist:', error)
    }
  }

  /**
   * Gửi email thông báo lịch đặt tour mới cho Buddy
   */
  async sendBuddyNotification(buddyEmail: string, bookingData: any, touristInfo: any, experienceTitle: string) {
    try {
      await transporter.sendMail({
        from: `"UniTravel" <${process.env.EMAIL_USER || process.env.SMTP_EMAIL}>`,
        to: buddyEmail,
        subject: `📅 UniTravel - Có khách đặt tour mới! Mã vé ${bookingData.bookingCode}`,
        html: buildBuddyHtml(bookingData, touristInfo, experienceTitle)
      })
      console.log(`[EmailService] Đã gửi email thông báo cho Buddy: ${buddyEmail}`)
    } catch (error) {
      console.error('[EmailService] Lỗi khi gửi email cho Buddy:', error)
    }
  }
}

const emailService = new EmailService()
export default emailService
