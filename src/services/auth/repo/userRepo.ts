import User from '@infra/db/models/user.model.js'
import { connectDB, disConnectDB } from '@infra/db/sequelize.js'

await connectDB()
await User.create({
  name: 'Goku1',
  email: 'goku1@email.com'
})

await disConnectDB()
