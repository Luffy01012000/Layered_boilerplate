import type { Prisma, User } from '#prismagenerated/prisma/client.js'

import BaseRepository from './BaseRepository.js'
import logger from '#shared/config/logger.js'
import { prisma } from '#shared/config/prisma.js'

export default class PrismaUserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  number
> {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      const user = await prisma.user.create({
        data
      })

      logger.info('User created', {
        meta: {
          email: user.email
        }
      })

      return user
    } catch (error) {
      logger.error('Error creating user', error)
      throw error
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: {
          id
        }
      })
    } catch (error) {
      logger.error('Error finding user by id', error)
      throw error
    }
  }

  async findByUsername(name: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: {
          name
        }
      })
    } catch (error) {
      logger.error('Error finding user by username', error)
      throw error
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: {
          email
        }
      })
    } catch (error) {
      logger.error('Error finding user by email', error)
      throw error
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await prisma.user.findMany()
    } catch (error) {
      logger.error('Error finding all users', error)
      throw error
    }
  }
}
