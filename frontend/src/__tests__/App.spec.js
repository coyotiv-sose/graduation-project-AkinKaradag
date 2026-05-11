import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../App.vue'

vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: null }),
  },
}))

describe('App', () => {
  it('renders the public layout for public routes', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
        mocks: {
          $route: {
            meta: { layout: 'public' },
          },
        },
        stubs: {
          RouterView: { template: '<div data-test="router-view" />' },
          PublicTopNav: { template: '<nav data-test="public-top-nav" />' },
        },
      },
    })

    await flushPromises()

    expect(wrapper.classes()).toContain('app-shell--public')
    expect(wrapper.find('[data-test="public-top-nav"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="router-view"]').exists()).toBe(true)
  })
})
