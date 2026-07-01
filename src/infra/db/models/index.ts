import { sequelize } from '../sequelize.js'

import { User } from './user/user.model.js'

User.associate(sequelize.models as unknown as Record<string, never>)
