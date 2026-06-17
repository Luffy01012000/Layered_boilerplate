import MailController from '../controller/mailController.js'
import NodemailerMailProvider from '../providers/nodemailerMailProvider.js'
import MailService from '../service/mailService.js'

class Container {
  static init() {
    const providers = {
      mailProvider: new NodemailerMailProvider()
    }

    const services = {
      mailService: new MailService(providers.mailProvider)
    }

    const controller = {
      mailController: new MailController(services.mailService)
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
