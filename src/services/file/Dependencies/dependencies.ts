import FileController from '../controller/fileController.js'
import LocalFileStorage from '../providers/localFileStorage.js'
import FileService from '../service/fileService.js'

class Container {
  static init() {
    const providers = {
      fileStorage: new LocalFileStorage()
    }

    const services = {
      fileService: new FileService(providers.fileStorage)
    }

    const controller = {
      fileController: new FileController(services.fileService)
    }

    return {
      providers,
      services,
      controller
    }
  }
}

const initialized = Container.init()
export { Container }
export default initialized
