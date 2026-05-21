import nodemailer from 'nodemailer'
import { config } from 'dotenv'
config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL as string,
    pass: process.env.SMTP_PASSWORD as string
  }
})

// ===== TEMPLATE: Verify Email =====
const buildVerifyEmailHtml = (name: string, verifyLink: string) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Xác thực email - UniTravel</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f6fb; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 580px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center; }
    .header img { width: 48px; height: 48px; margin-bottom: 12px; }
    .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 17px; color: #1a1a2e; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 28px; }
    .btn-wrap { text-align: center; margin-bottom: 28px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff !important; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; }
    .note { font-size: 13px; color: #999; text-align: center; line-height: 1.6; }
    .divider { border: none; border-top: 1px solid #f0f0f0; margin: 24px 0; }
    .footer { background: #f9f9fb; padding: 20px 32px; text-align: center; font-size: 12px; color: #bbb; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>✈️ UniTravel</h1>
      <p>Nền tảng du lịch dành cho sinh viên</p>
    </div>
    <div class="body">
      <div class="greeting">Xin chào, ${name}! 👋</div>
      <div class="text">
        Chào mừng bạn đến với <strong>UniTravel</strong>! Vui lòng xác thực địa chỉ email của bạn để bắt đầu khám phá những chuyến đi tuyệt vời.
      </div>
      <div class="btn-wrap">
        <a href="${verifyLink}" class="btn">✅ Xác thực Email ngay</a>
      </div>
      <hr class="divider" />
      <div class="note">
        Nếu nút trên không hoạt động, hãy copy link sau vào trình duyệt:<br/>
        <a href="${verifyLink}" style="color:#667eea; word-break:break-all;">${verifyLink}</a>
      </div>
      <br/>
      <div class="note">⏳ Link có hiệu lực trong <strong>7 ngày</strong>. Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.</div>
    </div>
    <div class="footer">© 2024 UniTravel. All rights reserved.</div>
  </div>
</body>
</html>
`

// ===== TEMPLATE: Forgot Password =====
const buildForgotPasswordHtml = (name: string, resetLink: string) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Đặt lại mật khẩu - UniTravel</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f6fb; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 580px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 17px; color: #1a1a2e; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 28px; }
    .btn-wrap { text-align: center; margin-bottom: 28px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff !important; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; }
    .note { font-size: 13px; color: #999; text-align: center; line-height: 1.6; }
    .divider { border: none; border-top: 1px solid #f0f0f0; margin: 24px 0; }
    .footer { background: #f9f9fb; padding: 20px 32px; text-align: center; font-size: 12px; color: #bbb; }
    .warning { background: #fff8e1; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #856404; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>✈️ UniTravel</h1>
      <p>Đặt lại mật khẩu của bạn</p>
    </div>
    <div class="body">
      <div class="greeting">Xin chào, ${name}! 🔐</div>
      <div class="text">
        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản UniTravel của bạn. Nhấn vào nút bên dưới để tiến hành.
      </div>
      <div class="btn-wrap">
        <a href="${resetLink}" class="btn">🔑 Đặt lại mật khẩu</a>
      </div>
      <hr class="divider" />
      <div class="note">
        Nếu nút trên không hoạt động, hãy copy link sau vào trình duyệt:<br/>
        <a href="${resetLink}" style="color:#f5576c; word-break:break-all;">${resetLink}</a>
      </div>
      <div class="warning">
        ⚠️ Link chỉ có hiệu lực trong <strong>1 giờ</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này và tài khoản của bạn vẫn an toàn.
      </div>
    </div>
    <div class="footer">© 2024 UniTravel. All rights reserved.</div>
  </div>
</body>
</html>
`

// ===== Send Functions =====
export const sendVerifyEmail = async (toEmail: string, name: string, email_verify_token: string) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const verifyLink = `${clientUrl}/verify-email?token=${email_verify_token}`

  await transporter.sendMail({
    from: `"UniTravel" <${process.env.SMTP_EMAIL}>`,
    to: toEmail,
    subject: '✅ Xác thực email - UniTravel',
    html: buildVerifyEmailHtml(name, verifyLink)
  })
}

export const sendForgotPasswordEmail = async (toEmail: string, name: string, forgot_password_token: string) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const resetLink = `${clientUrl}/reset-password?token=${forgot_password_token}`

  await transporter.sendMail({
    from: `"UniTravel" <${process.env.SMTP_EMAIL}>`,
    to: toEmail,
    subject: '🔑 Đặt lại mật khẩu - UniTravel',
    html: buildForgotPasswordHtml(name, resetLink)
  })
}
