import SequelizeRepository from '@shared/repo-extensions/SequelizeRepository.js'

import { User } from './user.model.js'
import type { UserAttrs, UserCreationAttrs } from './user.types.js'

export const usersRepo = new SequelizeRepository<
  InstanceType<typeof User>,
  UserCreationAttrs,
  UserAttrs['id']
>(User, { searchFields: ['email'] })
