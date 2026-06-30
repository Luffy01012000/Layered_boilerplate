import { DataTypes, Sequelize } from 'sequelize'

import type { Migration } from '../umzug.js'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.getQueryInterface()
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  })
}

export const down: Migration = async ({ context }) => {
  const queryInterface = context.getQueryInterface()
  await queryInterface.bulkDelete('users', {})
}
