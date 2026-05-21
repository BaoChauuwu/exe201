import { Request, Response } from 'express'
import usersService from '~/services/users.services'
import { ObjectId } from 'mongodb'

export const googleCallbackController = async (req: Request, res: Response) => {
  try {
    const user = req.user as any
    const user_id = user._id.toString()
    const result = await usersService.loginWithGoogle(user_id)

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    return res.redirect(
      `${clientUrl}/oauth-success?access_token=${result.access_token}&refresh_token=${result.refresh_token}`
    )
  } catch (error) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    return res.redirect(`${clientUrl}/login?error=google_oauth_failed`)
  }
}
