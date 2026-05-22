import databaseService from './services/database.services'

async function run() {
  try {
    await databaseService.connect()
    const email = 'hunglcbde180535@fpt.edu.vn'
    const user = await databaseService.users.findOne({ email })
    if (user) {
      console.log('USER_FOUND:', JSON.stringify(user, null, 2))
    } else {
      console.log('USER_NOT_FOUND')
    }
  } catch (err) {
    console.error('Error:', err)
  } finally {
    process.exit(0)
  }
}

run()
