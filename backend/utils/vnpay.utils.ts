import crypto from 'crypto'

/**
 * Sắp xếp các key của object theo thứ tự alphabet (A-Z) và URL encode đúng chuẩn VNPAY.
 * VNPAY yêu cầu thay thế %20 bằng + trong query string khi tạo chữ ký.
 */
export function sortObject(obj: Record<string, any>): Record<string, string> {
  const sorted: Record<string, string> = {}
  const keys = Object.keys(obj).sort()

  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+')
  }

  return sorted
}

/**
 * Format date theo chuẩn VNPAY: YYYYMMDDHHmmss
 */
export function formatVnpDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')

  const yyyy = date.getFullYear()
  const MM = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const HH = pad(date.getHours())
  const mm = pad(date.getMinutes())
  const ss = pad(date.getSeconds())

  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`
}

/**
 * Tạo chữ ký HMAC SHA512 theo chuẩn VNPAY.
 * Input là object đã được sortObject(), join bằng & thành query string.
 */
export function createVnpSignature(
  sortedParams: Record<string, string>,
  secretKey: string
): string {
  const signData = Object.entries(sortedParams)
    .map(([k, v]) => `${k}=${v}`)
    .join('&')

  return crypto.createHmac('sha512', secretKey).update(signData).digest('hex')
}

/**
 * Lấy IP thực của client, ưu tiên X-Forwarded-For (khi đứng sau proxy/load balancer).
 */
export function getClientIp(req: { headers: Record<string, any>; socket: any }): string {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim()
  }
  return req.socket?.remoteAddress || '127.0.0.1'
}
