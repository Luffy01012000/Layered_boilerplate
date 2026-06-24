import { EmployeeController } from '../controller/empController.js'
import { EmpRepo } from '../repo/empRepo.js'
import { EmpService } from '../services/empService.js'

class Container {
  static init() {
    const repositories = {
      employeeRepository: new EmpRepo()
    }

    const services = {
      employeeService: new EmpService(repositories.employeeRepository)
    }

    const controller = {
      employeeController: new EmployeeController(services.employeeService)
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
