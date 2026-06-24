import { AuthController } from '../controller/authController.js'
import { AuthService } from '../service/authService.js'
import PrismaUserRepository from '../repository/UserRepository.js'
import { jwtService } from '@shared/lib/jwt/index.js'

/**
 * Dependency Injection Container for the Auth module.
 * This container initializes and manages the dependencies for the Auth module,
 * including repositories, services, and controllers.
 */
class Container {
  static init() {
    // Initialize repositories
    const repositories = {
      userRepository: new PrismaUserRepository()
    }

    // Initialize services with their respective repositories

    const authService = new AuthService(repositories.userRepository, jwtService)

    const services = {
      authService
    }

    // Initialize controllers with their respective services
    const controller = {
      authController: new AuthController(services.authService)
    }

    return {
      repositories,
      services,
      controller
    }
  }
}

const initialized = Container.init()
export { Container }
export default initialized
