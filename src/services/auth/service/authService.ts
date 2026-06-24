import config from '@shared/config/index.js'
import AppError from '@shared/errors/AppError.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import logger from '@shared/lib/logger.js'
import { APPLICATION_ROLES } from '@shared/constants/roles.js'
import { IUserRepository } from '../interfaces/userRepository.js'
import { RegisterDto } from '../dto/register.dto.js'
import type { Employee } from '@prisma/client'
import { UnauthorizedError } from '@shared/errors/UnauthorizedError.js'
import { NotFoundError } from '@shared/errors/NotFoundError.js'
import { JwtService } from '@shared/lib/jwt/jwt.service.js'

/**
 * AuthService handles user authentication and authorization related operations such as onboarding super admin, user registration, login, and fetching user profile.
 * It interacts with the UserRepository to perform these operations and generates JWT tokens for authenticated users.
 */
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService
  ) {
    if (!userRepository) {
      throw new Error('UserRepository is Required')
    }
    this.userRepository = userRepository
    this.jwtService = jwtService
  }

  /**
   * Generates a JWT token for the given user.
   * @param {Object} user - The user object for which the token is generated.
   * @returns {string} - The generated JWT token.
   */
  generateToken(user: Employee) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.roleId
    }

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiresIn
    })
  }

  /**
   * Formats the user object for response by removing sensitive information.
   * @param {Object} user - The user object to be formatted.
   * @returns {Object} - The formatted user object.
   */
  formatUserForResponse(user: Employee) {
    const { password: _password, ...safeUser } = user
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
   * Registers a new user.
   * @param {Object} userData - The data of the user to be registered.
   * @returns {Promise<Object>} - Returns an object containing the user and token.
   */
  async register(dto: RegisterDto) {
    try {
      const existingEmail = await this.userRepository.findByEmail(dto.email)
      if (existingEmail) {
        throw new AppError('Email already exists', 409)
      }

      const passwordHash = await bcrypt.hash(dto.password, 12)
      const user = await this.userRepository.create({
        email: dto.email,
        name: dto.name,
        roleId: dto.role,
        password: passwordHash
      })
      const token = this.jwtService.signAccessToken({
        userId: user.id,
        email: user.email,
        roleId: user.roleId
      })

      logger.info('User registered successfully', {
        meta: {
          email: user.email
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
    email: string,
    password: string
  ): Promise<{ user: Omit<Employee, 'password'>; token: string }> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const isPasswordValid = await this.comparePassword(password, user.password)
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401)
    }
    const token = this.jwtService.signAccessToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    })

    logger.info('User logged in successfully', {
      meta: { username: user.name, email: user.email }
    })

    return {
      user: this.formatUserForResponse(user),
      token
    }
  }

  /**
   * Fetches the profile of a user by their ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object>} - Returns the user's profile data.
   */
  async getProfile(userId: string) {
    try {
      const user = await this.userRepository.findProfile(userId)
      if (!user) {
        throw new NotFoundError('User not found')
      }
      return this.formatUserForResponse(user)
    } catch (error) {
      logger.error('Error getting user profile:', error)
      throw error
    }
  }

  async deleteEmp(userId: string) {
    try {
      const user = await this.userRepository.delete(userId)
      if (!user) {
        throw new AppError('User not found', 404)
      }
      return this.formatUserForResponse(user)
    } catch (error) {
      logger.error('Error getting user profile:', error)
      throw error
    }
  }

  async checkSuperAdminPermissions(userId: string) {
    try {
      const user = await this.userRepository.findByIdWithRole(userId)
      if (!user) {
        throw new AppError('User not found', 404)
      }

      return user?.role?.name === APPLICATION_ROLES.SUPER_ADMIN
    } catch (error) {
      logger.error('Error checking super admin permissions', error)
      throw error
    }
  }
}
