import type { Optional } from 'sequelize'

export interface UserAttrs {
  id: string
  email: string
  passwordHash: string
  roleId: string
  createdAt: Date
  updatedAt: Date
}

export type UserCreationAttrs = Optional<
  UserAttrs,
  'id' | 'roleId' | 'createdAt' | 'updatedAt'
>
