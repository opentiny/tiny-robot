import { App } from 'vue'
import ContainerComponent from './index.vue'

ContainerComponent.name = 'TrContainer'

const install = function <T>(app: App<T>) {
  app.component(ContainerComponent.name!, ContainerComponent)
}

ContainerComponent.install = install

/**
 * @deprecated Container is kept for compatibility. Use `Layout` (`TrLayout`) for new layouts.
 */
const Container = ContainerComponent as typeof ContainerComponent & { install: typeof install }

export default Container
