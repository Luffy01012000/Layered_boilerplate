import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../../sequelize.js'

import type { UserAttrs, UserCreationAttrs } from './user.types.js'

export class User
  extends Model<UserAttrs, UserCreationAttrs>
  implements UserAttrs
{
  declare id: string
  declare email: string
  declare passwordHash: string
  declare roleId: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  static associate(_models: Record<string, Model>): void {
    // reserved for future relations; no-op in v1
  }

  static findByEmail(email: string) {
    return User.findOne({ where: { email } })
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: new DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: new DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    roleId: {
      type: new DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'USER',
      field: 'role_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  },
  { sequelize, tableName: 'users', underscored: true }
)
