import { _electron as electron } from 'playwright'
import { test, expect } from 'playwright-test-coverage'

// Example test to show playwright working
// Remove once real app starts development
test.skip('Test default Vite app counter', async () => {
  const electronApp = await electron.launch({ args: ['src/main/main.js'] })
  const window = await electronApp.firstWindow()
  window.on('console', console.log)

  await window.getByTestId('initialize-download-location').click()

  // TODO how to choose a download location when CI isn't running mac os?

  // choose a location

  await expect(window.getByTestId('count-button')).toHaveText('count is 1')

  await window.getByTestId('count-button').click()

  await expect(window.getByTestId('count-button')).toHaveText('count is 2')

  // close app
  await electronApp.close()
})
