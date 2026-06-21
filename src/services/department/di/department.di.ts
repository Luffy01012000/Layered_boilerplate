import { DepartmentController } from '../controller/departmentController.js'
import { DepartmentService } from '../service/departmentService.js'
import DepartmentRepository from '../repo/departmentRepo.js'

/**
 * Dependency Injection Container for the Auth module.
 * This container initializes and manages the dependencies for the Auth module,
 * including repositories, services, and controllers.
 */
class Container {
  static init() {
    // Initialize repositories
    const repositories = {
      departmentRepository: new DepartmentRepository()
    }

    // Initialize services with their respective repositories
    const services = {
      departmentService: new DepartmentService(
        repositories.departmentRepository
      )
    }

    // Initialize controllers with their respective services
    const controller = {
      departmentController: new DepartmentController(services.departmentService)
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
