import config from '#shared/config/index.js'
import AppError from '#shared/utils/AppError.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import logger from '#shared/config/logger.js'
import { APPLICATION_ROLES } from '#shared/constants/roles.js'
import { IUserRepository } from '../interfaces/userRepository.js'
import { RegisterDto } from '../dto/register.dto.js'
import type { User } from '#prismagenerated/prisma/client.js'

/**
 * AuthService handles user authentication and authorization related operations such as onboarding super admin, user registration, login, and fetching user profile.
 * It interacts with the UserRepository to perform these operations and generates JWT tokens for authenticated users.
 */
export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {
    if (!userRepository) {
      throw new Error('UserRepository is Required')
    }
    this.userRepository = userRepository
  }

  /**
   * Generates a JWT token for the given user.
   * @param {Object} user - The user object for which the token is generated.
   * @returns {string} - The generated JWT token.
   */
  generateToken(user: User) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    }

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    })
  }

  /**
   * Formats the user object for response by removing sensitive information.
   * @param {Object} user - The user object to be formatted.
   * @returns {Object} - The formatted user object.
   */
  formatUserForResponse(user: User) {
    const { passwordHash: _passwordHash, ...safeUser } = user
    return safeUser
  }

  /**
   * Compares the user-entered password with the hashed password.
   * @param {string} userEnteredPassword - The password entered by the user.
   * @param {string} hashedPassword - The hashed password stored in the database.
   * @returns {Promise<boolean>} - Returns true if the passwords match, otherwise false.
   */
  async comparePassword(userEnteredPassword: string, hashedPassword: string) {
    return await bcrypt.compare(userEnteredPassword, hashedPassword)
  }

  /**
   * Onboards a new super admin user.
   * @param {Object} superAdminData - The data of the super admin to be onboarded.
   * @returns {Promise<Object>} - Returns an object containing the user and token.
   */
  async onboardSuperAdmin(superAdminData: RegisterDto) {
    try {
      const existingUser = await this.userRepository.findAll()

      if (existingUser && existingUser.length > 0) {
        throw new AppError('Super admin onboarding is disabled', 403)
      }

      const passwordHash = await bcrypt.hash(superAdminData.password, 12)
      const user = await this.userRepository.create({
        email: superAdminData.email,
        name: superAdminData.name,
        role: APPLICATION_ROLES.SUPER_ADMIN,
        passwordHash
      })
      const token = this.generateToken(user)

      logger.info('Admin onboarded successfully', {
        username: user.name
      })

      return {
        user: this.formatUserForResponse(user),
        token
      }
    } catch (error) {
      logger.error('Error in onboarding Super admin', error)
      throw error
    }
  }

  /**
   * Registers a new user.
   * @param {Object} userData - The data of the user to be registered.
   * @returns {Promise<Object>} - Returns an object containing the user and token.
   */
  async register(dto: RegisterDto) {
    try {
      const existingUser = await this.userRepository.findByUsername(dto.name)
      if (existingUser) {
        throw new AppError('Username already exists', 409)
      }

      const existingEmail = await this.userRepository.findByEmail(dto.email)
      if (existingEmail) {
        throw new AppError('Email already exists', 409)
      }

      const passwordHash = await bcrypt.hash(dto.password, 12)
      const user = await this.userRepository.create({
        email: dto.email,
        name: dto.name,
        role: dto.role ?? APPLICATION_ROLES.USER,
        passwordHash
      })
      const token = this.generateToken(user)

      logger.info('User registered successfully', {
        meta: {
          username: user.name
        }
      })

      return {
        user: this.formatUserForResponse(user),
        token
      }
    } catch (error) {
      logger.error('Error in Register service', error)
      throw error
    }
  }

  /**
   * Logs in a user.
   * @param {string} name - The username of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<Object>} - Returns an object containing the user and token.
   */
  async login(
    name: string,
    password: string
  ): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    try {
      const user = await this.userRepository.findByUsername(name)

      if (!user) {
        throw new AppError('Invalid credentials', 401)
      }

      // if (!user.isActive) {
      //   throw new AppError('Account is deactivated', 403)
      // }

      const isPasswordValid = await this.comparePassword(
        password,
        user.passwordHash
      )
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401)
      }
      const token = this.generateToken(user)

      logger.info('User logged in successfully', { username: user.name })

      return {
        user: this.formatUserForResponse(user),
        token
      }
    } catch (error) {
      logger.error('Error in Login service', error)
      throw error
    }
  }

  /**
   * Fetches the profile of a user by their ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object>} - Returns the user's profile data.
   */
  async getProfile(userId: number) {
    try {
      const user = await this.userRepository.findById(userId)
      if (!user) {
        throw new AppError('User not found', 404)
      }
      return this.formatUserForResponse(user)
    } catch (error) {
      logger.error('Error getting user profile:', error)
      throw error
    }
  }

  async checkSuperAdminPermissions(userId: number) {
    try {
      const user = await this.userRepository.findById(userId)
      if (!user) {
        throw new AppError('User not found', 404)
      }

      return user.role === APPLICATION_ROLES.SUPER_ADMIN
    } catch (error) {
      logger.error('Error checking super admin permissions', error)
      throw error
    }
  }
}
