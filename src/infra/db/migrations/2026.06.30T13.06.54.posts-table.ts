import { DataTypes, Sequelize } from 'sequelize'

import type { Migration } from '../umzug.js'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.getQueryInterface()
  await queryInterface.createTable('posts', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },

    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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

  await queryInterface.addIndex('posts', ['user_id'], {
    name: 'idx_posts_user_id'
  })

  await queryInterface.addIndex('posts', ['published'], {
    name: 'idx_posts_published'
  })
}

export const down: Migration = async ({ context }) => {
  const queryInterface = context.getQueryInterface()
  await queryInterface.removeIndex('posts', 'idx_posts_published')
  await queryInterface.removeIndex('posts', 'idx_posts_user_id')

  await queryInterface.dropTable('posts')
}
