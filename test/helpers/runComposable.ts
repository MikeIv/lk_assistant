import { createApp, defineComponent, h } from 'vue'

/** Запускает composable в setup-контексте (onMounted / onUnmounted отрабатывают). */
export function runComposable<T>(factory: () => T): { result: T; unmount: () => void } {
  let result!: T
  const root = document.createElement('div')
  const app = createApp(
    defineComponent({
      setup() {
        result = factory()
        return () => h('div')
      },
    }),
  )
  app.mount(root)

  return {
    result,
    unmount: () => {
      app.unmount()
      root.remove()
    },
  }
}
