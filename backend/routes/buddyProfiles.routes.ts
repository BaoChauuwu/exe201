import { Router } from 'express'
import { getMyBuddyProfile, updateBuddyProfile, getAllBuddies, getBuddyProfileById } from '../controllers/buddyProfiles.controllers'
import { accessTokenValidator, requireRole } from '../middlewares/users.middlewares'
import { wrapRequestHandler } from '../utils/handlers'

const buddyProfilesRouter = Router()

buddyProfilesRouter.get('/me', accessTokenValidator, requireRole(['buddy']), wrapRequestHandler(getMyBuddyProfile))
buddyProfilesRouter.post('/update', accessTokenValidator, requireRole(['buddy']), wrapRequestHandler(updateBuddyProfile))

buddyProfilesRouter.get('/', wrapRequestHandler(getAllBuddies))
buddyProfilesRouter.get('/:id', wrapRequestHandler(getBuddyProfileById))

export default buddyProfilesRouter
