import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes
} from 'sequelize'
import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  HasMany,
  IsEmail,
  Model,
  Table,
  Unique,
  UpdatedAt
} from 'sequelize-typescript'

import Post from './post.model.js'

@Table({
  tableName: 'users',
  modelName: 'User'
})
export default class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @Column({
    primaryKey: true,
    type: DataType.UUID
  })
  declare id: CreationOptional<string>

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    validate: {
      len: [3, 100]
    }
  })
  declare name: string

  @AllowNull(false)
  @IsEmail
  @Unique
  @Column({
    type: DataType.STRING
  })
  set email(value: string) {
    this.setDataValue('email', value ? value.toLowerCase() : value)
  }

  @CreatedAt
  declare created_at: CreationOptional<Date>

  @UpdatedAt
  declare updated_at: CreationOptional<Date>

  @HasMany(() => Post)
  declare posts?: InferAttributes<Post>[]

  toJson(): any {
    return {
      ...this.get(),
      created_at: undefined,
      updated_at: undefined
    }
  }
}
