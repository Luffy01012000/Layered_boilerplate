import ResponseFormatter from '#shared/utils/responseFormatter.js'
import type { Request, Response, NextFunction } from 'express'
import { IAuthService } from '../interfaces/authService.js'

/**
 * @description AuthController handles user authentication and authorization related operations such as onboarding super admin, user registration, login, fetching user profile, and logout.
 * It interacts with the AuthService to perform these operations and formats the responses using ResponseFormatter.
 */
export class AuthController {
  constructor(private readonly authService: IAuthService) {
    if (!authService) {
      throw new Error('authService is Required')
    }

    this.authService = authService
  }

  /**
   * Onboards a new super admin user.
   * @param {Request} req - The request object containing user details.
   * @param {Response} res - The response object used to send the response.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async onboardSuperAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body
      const superAdminData = {
        name,
        email,
        password
      }

      const { token, user } =
        await this.authService.onboardSuperAdmin(superAdminData)

      res.cookie('authToken', token, {
        httpOnly: true,
        sameSite: 'lax'
      })

      res
        .status(201)
        .json(
          ResponseFormatter.success(
            { user, token },
            'Super admin created successfully',
            201
          )
        )
    } catch (error) {
      next(error)
    }
  }

  /**
   * Registers a new user.
   * @param {Request} req - The request object containing user details.
   * @param {Response} res - The response object used to send the response.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body
      const userData = {
        name,
        email,
        password,
        role
      }

      const { token, user } = await this.authService.register(userData)

      res.cookie('authToken', token, {
        httpOnly: true,
        sameSite: 'lax'
      })

      res
        .status(201)
        .json(
          ResponseFormatter.success(
            { user, token },
            'User created successfully',
            201
          )
        )
    } catch (error) {
      next(error)
    }
  }

  /**
   * Logs in a user.
   * @param {Request} req - The request object containing user credentials.
   * @param {Response} res - The response object used to send the response.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, password } = req.body
      const { user, token } = await this.authService.login(name, password)

      res.cookie('authToken', token, {
        httpOnly: true,
        sameSite: 'lax'
      })

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            { user, token },
            'User logged in successfully',
            200
          )
        )
    } catch (error) {
      next(error)
    }
  }

  /**
   * Fetches the profile of the logged-in user.
   * @param {Request} req - The request object containing user details.
   * @param {Response} res - The response object used to send the response.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.user.userId
      const result = await this.authService.getProfile(userId)

      res
        .status(200)
        .json(
          ResponseFormatter.success(result, 'Profile fetched successfully', 200)
        )
    } catch (error) {
      next(error)
    }
  }

  /**
   * Logs out the currently logged-in user.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object used to send the response.
   * @param {Function} next - The next middleware function in the request-response cycle.
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('authToken')
      res
        .status(200)
        .json(ResponseFormatter.success(null, 'Logout successful', 200))
    } catch (error) {
      next(error)
    }
  }
}
