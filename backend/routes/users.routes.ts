import { Router } from 'express'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenMiddleware,
  registerValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  verifyForgotPasswordTokenValidator
} from '../middlewares/users.middlewares'
import {
  emailVerifyController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  verifyForgotPasswordTokenController
} from '../controllers/users.controllers'
import { googleCallbackController } from '../controllers/google.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import passport from '~/middlewares/passport.middleware'

const usersRouter = Router()

// POST /users/login
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

// POST /users/register
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

usersRouter.post('/logout', accessTokenValidator, refreshTokenMiddleware, wrapRequestHandler(logoutController))

usersRouter.post('/verify-email', verifyEmailValidator, wrapRequestHandler(emailVerifyController))

usersRouter.post('/resend-email-verify', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))

usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

usersRouter.post(
  '/verify-forgot-password-token',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordTokenController)
)
// reset password k cần biết mk cũ
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

// Google OAuth
usersRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
usersRouter.get('/google/callback', passport.authenticate('google', { session: false }), googleCallbackController)

export default usersRouter

