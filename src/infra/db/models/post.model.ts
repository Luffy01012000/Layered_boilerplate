import {
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes
} from 'sequelize'
import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
  BelongsTo
} from 'sequelize-typescript'

import User from './user.model.js'

@Table({
  tableName: 'posts',
  modelName: 'Post'
})
export default class Post extends Model<
  InferAttributes<Post>,
  InferCreationAttributes<Post>
> {
  @Column({
    primaryKey: true,
    type: DataType.UUID
  })
  declare id: CreationOptional<string>

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID
  })
  declare user_id: string

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    validate: {
      len: [1, 100]
    }
  })
  declare title: string

  @AllowNull(false)
  @Column({
    type: DataType.TEXT
  })
  declare content: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  declare published: CreationOptional<boolean>

  @CreatedAt
  declare created_at: CreationOptional<Date>

  @UpdatedAt
  declare updated_at: CreationOptional<Date>

  @BelongsTo(() => User)
  declare author?: InferAttributes<User>

  toJson(): any {
    return {
      ...this.get(),
      created_at: undefined,
      updated_at: undefined
    }
  }
}
