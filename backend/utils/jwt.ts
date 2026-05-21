import { rejects } from 'assert'
import { error } from 'console'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { resolve } from 'path'
import { SignOptions } from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.requests'

// thường khai báo xong có : là khai báo kiểu dữ liệu của biến đó, còn = là gán giá trị cho biến đó
export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: any | string | Buffer
  privateKey: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, rejects) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw rejects(error)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<TokenPayload>((resolve, rejects) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        throw rejects(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
