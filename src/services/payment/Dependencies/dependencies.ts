import PaymentController from '../controller/paymentController.js'
import FakePaymentGateway from '../providers/fakePaymentGateway.js'
import PaymentService from '../service/paymentService.js'

class Container {
  static init() {
    const providers = {
      paymentGateway: new FakePaymentGateway()
    }

    const services = {
      paymentService: new PaymentService(providers.paymentGateway)
    }

    const controller = {
      paymentController: new PaymentController(services.paymentService)
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
